import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Index, Pinecone, RecordMetadata } from '@pinecone-database/pinecone';
import { firestore as FirebaseFirestore } from 'firebase-admin';
import pdfParse from 'pdf-parse';
import { GeminiService } from 'src/gemini/gemini.service';

interface SOPMetadata extends RecordMetadata {
  source: string;
  text: string;
  chunkIndex: number;
}

export interface RAGContext {
  relevantChunks: Array<{
    text: string,
    source: string;
    score: number,
  }>,
  sourceDocuments: string[],
}

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);
  private readonly indexName: string;
  private readonly namespace = 'sops';
  private readonly chunkSize = 1000;
  private readonly chunkOverlap = 200;

  constructor(
    @Inject('PINECONE_CLIENT') private readonly pinecone: Pinecone,
    @Inject('FIRESTORE') private readonly firestore: FirebaseFirestore.Firestore,
    private readonly configService: ConfigService,
    private readonly geminiService: GeminiService,
  ) {
    this.indexName = this.configService.get<string>('PINECONE_INDEX_NAME') || 'supportlens-kb';
  }

  // get pinecone index instance
  private getIndex(): Index<SOPMetadata> {
    return this.pinecone.index<SOPMetadata>(this.indexName);
  }

  // generate embedding using gemini embedding API

  // split text to chunks with overlap
  private splitTextIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    let startIndex = 0;
    const cleanText = text.replace(/\s+/g, ' ').trim();
    while (startIndex < cleanText.length) {
      let endIndex = startIndex + this.chunkSize;

      if (endIndex < cleanText.length) {
        const lastPeriod = cleanText.lastIndexOf('.', endIndex);
        const lastNewline = cleanText.lastIndexOf('\n', endIndex);
        const breakPoint = Math.max(lastPeriod, lastNewline);
        if (breakPoint > startIndex + this.chunkSize / 2) {
          endIndex = breakPoint + 1;
        }
      }
      const chunk = cleanText.slice(startIndex, endIndex).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      startIndex = endIndex - this.chunkOverlap;
      if (startIndex >= cleanText.length) break;
    }
    return chunks;
  }

  async parsePDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      this.logger.error(`Error parsing PDF: ${error.message}`);
      throw new Error('Failed to parse PDF file');
    }
  }

  async uploadDocument(
    file: Express.Multer.File
  ): Promise<{ status: string; chunks: number; filename: string}> {
    const filename = file.originalname;
    this.logger.log(`Processing document: ${filename}`);

    try {
      // 1. parse pdf to text
      const text = await this.parsePDF(file.buffer);
      this.logger.debug(`Extracted ${text.length} characters from PDF`);

      // 2. split text to chunks
      const chunks = this.splitTextIntoChunks(text);
      this.logger.log(`Split into ${chunks.length} chunks`);

      // 3. generate embeddings and prepare vectors to upsert
      const index = this.getIndex();
      const vectors: Array<{ id: string, values: number[], metadata: SOPMetadata }> = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await this.geminiService.generateEmbedding(chunk);
        
        const prefix = filename.replace(/[^a-zA-Z0-9]/g, '_')

        vectors.push({
          id: `${prefix}_chunk_${i}`,
          values: embedding,
          metadata: {
            source: filename,
            text: chunk,
            chunkIndex: i
          }
        });

        if ((i + 1) % 5 == 0) {
          this.logger.debug(`Processed ${i + 1}/${chunks.length} chunks`);
        }
      }

      // 4. upsert vectors to pinecone
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.namespace(this.namespace).upsert(batch);
      }
      this.logger.log(`Successfully indexed ${vectors.length} vectors for ${filename}`);

      // 5. save metadata document to firestore
      await this.firestore.collection('knowledge_base').add({
        filename: filename,
        uploadedAt: new Date().toISOString(),
        chunksCount: chunks.length,
        status: 'indexed',
      });

      return {
        status: 'indexed',
        chunks: chunks.length,
        filename: filename,
      }
    } catch (error) {
      this.logger.error(`Error uploading document: ${error.message}`);
      throw error;
    }    
  }

  // query pinecone for RAG
  async queryRelevanContext(query: string, topK: number = 5): Promise<RAGContext> {
    try {
      const queryEmbedding = await this.geminiService.generateEmbedding(query);

      const index = this.getIndex();
      const queryResponse = await index.namespace(this.namespace).query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
      });

      const relevantChunks = queryResponse.matches?.map((match) => ({
        text: match.metadata?.text || '',
        source: match.metadata?.source || 'unknown',
        score: match.score || 0,
      }));

      const sourceDocuments = [...new Set(relevantChunks.map((c) => c.source))];
      
      this.logger.debug(`Found ${relevantChunks.length} relevant chunks from ${sourceDocuments.length} documents`);

      return {
        relevantChunks,
        sourceDocuments
      }
    } catch (error) {
      this.logger.error(`Error querying Pinecone: ${error.message}`);
      return {
        relevantChunks: [],
        sourceDocuments: [],
      }
    }
  } 

    async listDocuments(): Promise<Array<{
    id: string;
    filename: string;
    uploadedAt: string;
    chunksCount: number;
    status: string;
  }>> {
    const snapshot = await this.firestore.collection('knowledge_base').orderBy('uploadedAt', 'desc').get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      filename: doc.data().filename,
      uploadedAt: doc.data().uploadedAt,
      chunksCount: doc.data().chunksCount,
      status: doc.data().status,
    }));
  }

  async deleteDocument(documentId: string) {
    try {
      const docRef = this.firestore.collection('knowledge_base').doc(documentId);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Document not found');
      }

      const filename = doc.data()?.filename;
      const chunksCount = doc.data()?.chunksCount || 0;

      const index = this.getIndex();
      const prefix = filename.replace(/[^a-zA-Z0-9]/g, '_');

      // generate all vector IDs based on the naming convention used during upload
      const vectorIds: string[] = [];
      for (let i = 0; i < chunksCount; i++) {
        vectorIds.push(`${prefix}_chunk_${i}`);
      }

      // delete vectors by IDs
      if (vectorIds.length > 0) {
        await index.namespace(this.namespace).deleteMany(vectorIds);
      }

      // delete from firestore
      await docRef.delete();

      this.logger.log(`Deleted document: ${filename} (${vectorIds.length} vectors)`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting document: ${error.message}`);
      throw error;
    }
  }
}

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import * as admin from 'firebase-admin';
import { firestore as FirebaseFirestore } from 'firebase-admin';
import { ICurrentUser } from 'src/common/interfaces/current-user.interface';
import { GeminiService, TicketAnalysis } from 'src/gemini/gemini.service';
import { CreateTicketDto } from './dto/create-ticket-dto';
import { KnowledgeBaseService } from 'src/knowledge-base/knowledge-base.service';

@Injectable()
export class TicketsService {
  constructor(@Inject('FIRESTORE') private firestore: FirebaseFirestore.Firestore, private readonly geminiService: GeminiService, private readonly knowledgeBaseService: KnowledgeBaseService) { }

  async create(createTicketDto: CreateTicketDto) {
    const aiAnalysis: TicketAnalysis = await this.geminiService.analyzeTicket(createTicketDto.message);

    const ticketData = {
      senderName: createTicketDto.name || '',
      senderEmail: createTicketDto.email || '',
      initialMessage: createTicketDto.message,
      status: 'OPEN',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      aiAnalysis: {
        category: aiAnalysis.category,
        sentiment: aiAnalysis.sentiment,
        urgencyScore: aiAnalysis.urgencyScore,
        summary: aiAnalysis.summary,
      },
      messages: [
        {
          sender: 'customer',
          message: createTicketDto.message,
          time: new Date().toISOString(),
        }
      ]
    };

    const docRef = await this.firestore.collection('tickets').add(ticketData);

    return {
      ticketId: docRef.id,
      ai_analysis: aiAnalysis,
    }
  }
  
  async findAll(status?: string) {
    let query: FirebaseFirestore.Query = this.firestore.collection('tickets');
    
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async findOne(id: string) {
    const doc = await this.firestore.collection('tickets').doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Ticket dengan ID ${id} tidak ditemukan`);
    }

    return {
      id: doc.id,
      ...doc.data(),
    }
  }

  async reply(id: string, replyDto: ReplyTicketDto, user: ICurrentUser) {
    const ticketRef = this.firestore.collection('tickets').doc(id);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      throw new NotFoundException('Ticket tidak ditemukan');
    }

    const newMessage = {
      sender: 'agent',
      message: replyDto.message,
      time: new Date().toISOString(),
      agentEmail: user.email,
      agentRole: user.role,
    }

    const updateData: any = {
      messages: admin.firestore.FieldValue.arrayUnion(newMessage)
    }

    if (replyDto.closeTicket) {
      updateData.status = 'CLOSED'
    }

    await ticketRef.update(updateData);
    
    return { success: true };
  } 

  async summarize(id: string) {
    const ticketRef = this.firestore.collection('tickets').doc(id);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      throw new NotFoundException('Ticket tidak ditemukan');
    }

    const ticketData = ticketDoc.data();
    const messages = ticketData?.messages || [];

    if (messages.length == 0) {
      return { summary: 'Belum ada percakapan.' }
    }

    const summary = await this.geminiService.summarizeConversation(messages);

    await ticketRef.update({ 'aiAnalysis.summary': summary });
    return { summary };
  }

  async generateDraft(id: string, contextMessage: string) {
    const ticketDoc = await this.firestore.collection('tickets').doc(id).get();

    if (!ticketDoc.exists) {
      throw new NotFoundException('Ticket tidak ditemukan');
    }

    const ticketData = ticketDoc.data();
    const previousMessages = ticketData?.messages || [];

    const ragContext = await this.knowledgeBaseService.queryRelevanContext(contextMessage, 5);

    const draft = await this.geminiService.generateDraftReply(
      contextMessage,
      ragContext,
      previousMessages
    );

    return {
      draftReply: draft.draftReply,
      sourceDocument: draft.sourceDocuments && draft.sourceDocuments?.length > 0 ? draft.sourceDocuments[0] : undefined,
      sourceDocuments: draft.sourceDocuments,
      ragContextUsed: draft.relevantContextUsed,
    };
  }
}

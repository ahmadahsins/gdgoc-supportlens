import { GoogleGenAI } from '@google/genai';
import { Inject, Injectable, Logger } from '@nestjs/common';

export interface TicketAnalysis {
  category: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  urgencyScore: number;
  summary: string;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly MODEL_NAME = 'gemini-2.5-flash';

  constructor(@Inject('GEMINI_CLIENT') private readonly ai: GoogleGenAI) { }
  
  async analyzeTicket(message: string): Promise<TicketAnalysis> {
    const prompt = `
    Kamu adalah AI Customer Support Analyst. Analisis pesan keluhan customer berikut dan berikan output dalam format JSON yang ketat.
    PESAN CUSTOMER:
    """
    ${message}
    """
    INSTRUKSI:
    1. Tentukan KATEGORI isu dari opsi berikut: "Technical Issue", "Billing Issue", "Account Issue", "General Inquiry", "Feature Request", "Other"
    2. Tentukan SENTIMEN dari opsi: "Positive", "Neutral", "Negative"
    3. Berikan URGENCY SCORE dari 1-10 (10 = sangat urgent/darurat)
    4. Buat SUMMARY singkat maksimal 2 kalimat dalam Bahasa Indonesia
    Berikan response dalam format JSON sesuai schema yang diberikan.
    `;
    
    const analysisSchema = {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: [
            'Technical Issue',
            'Billing Issue',
            'Account Issue',
            'General Inquiry',
            'Feature Request',
            'Other',
          ],
          description: 'Kategori isu tiket',
        },
        sentiment: {
          type: 'string',
          enum: ['Positive', 'Neutral', 'Negative'],
          description: 'Sentimen pesan customer',
        },
        urgencyScore: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Tingkat urgensi tiket (1-10)',
        },
        summary: {
          type: 'string',
          description: 'Ringkasan singkat isu dalam Bahasa Indonesia',
        },
      },
      required: ['category', 'sentiment', 'urgencyScore', 'summary'],
    };

    try {
      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: analysisSchema,
        }
      });

      const resultText = response.text!;
      this.logger.debug('Gemini Analysis Result: ' + resultText);

      const analysis: TicketAnalysis = JSON.parse(resultText);
      return analysis;
    } catch (error) {
      this.logger.error('Error analyzing ticket: ' + error);
      return {
        category: 'Other',
        sentiment: 'Neutral',
        urgencyScore: 5,
        summary: 'Gagal menganalisis tiket secara otomatis.',
      };    
    }
  }
}

import { GoogleGenAI } from '@google/genai';
import { Inject, Injectable, Logger } from '@nestjs/common';

export interface TicketAnalysis {
  category: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  urgencyScore: number;
  summary: string;
}

export interface DraftResponse {
  draftReply: string;
  sourceDocument?: string;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly MODEL_NAME = 'gemini-2.5-flash';

  constructor(@Inject('GEMINI_CLIENT') private readonly ai: GoogleGenAI) { }
  
  async analyzeTicket(message: string): Promise<TicketAnalysis> {
    const prompt = `
    You are an AI Customer Support Analyst. Analyze the following customer complaint message and provide output in strict JSON format.
    
    CUSTOMER MESSAGE:
    """
    ${message}
    """
    
    INSTRUCTIONS:
    1. Determine the CATEGORY of the issue from the following options: "Technical Issue", "Billing Issue", "Account Issue", "General Inquiry", "Feature Request", "Other"
    2. Determine the SENTIMENT from the options: "Positive", "Neutral", "Negative"
    3. Provide an URGENCY SCORE from 1-10 (10 = very urgent/emergency)
    4. Create a brief SUMMARY in maximum 2 sentences in Indonesian (Bahasa Indonesia)
    
    Provide the response in JSON format according to the given schema.
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
        contents: [{ role: 'user', parts: [{ text: prompt + `\nMessage: "${message}"` }] }],
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
        summary: 'Auto-analysis failed via Gemini.',
      };    
    }
  }

  async summarizeConversation(messages: Array<{ sender: string, message: string }> ): Promise<string> {
    const formattedMessages = messages.map((m) => `${m.sender.toUpperCase()}: ${m.message}`).join('\n');
    
    const prompt = `
    You are an AI Customer Support Assistant. Create a summary of the following customer support conversation.
    
    CONVERSATION:
    """
    ${formattedMessages}
    """
    
    INSTRUCTIONS:
    - Write the summary in Indonesian (Bahasa Indonesia)
    - Maximum 3-4 sentences
    - Focus on the core issue and resolution status
    - Do not use list/bullet format
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: prompt}] }],
      });

      return response.text || 'Auto-summary failed via Gemini.';
    } catch (error) {
      this.logger.error(`Error summarizing conversation: ${error.message}`);
      return 'Auto-summary failed via Gemini.';
    }
  }

  async generateDraftReply(contextMessage: string, previousMessages?: Array<{ sender: string, message: string }>): Promise<DraftResponse> {
    let conversationContext = "";
    if (previousMessages && previousMessages.length > 0) {
      conversationContext = previousMessages.map((m) => `${m.sender.toUpperCase()}: ${m.message}`).join('\n');
    }

    const prompt = `
    You are a friendly and professional AI Customer Support Agent.
    Your task is to create a draft reply for the customer's message.
    
    ${conversationContext ? `CONVERSATION HISTORY:\n"""\n${conversationContext}\n"""\n` : ''}
    LATEST CUSTOMER MESSAGE:
    """
    ${contextMessage}
    """
    
    INSTRUCTIONS:
    - Write a polite, empathetic, and solution-oriented reply in Indonesian (Bahasa Indonesia)
    - Use professional yet friendly language
    - If there is a technical issue, ask for more information needed
    - End with a question or offer of assistance
    - Reply length should be 2-4 sentences
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: prompt}] }],
      });

      return {
        draftReply: response.text || 'Tidak dapat membuat draf balasan.',
        sourceDocument: undefined
      };
    } catch (error) {
      this.logger.error(`Error generating draft reply: ${error.message}`);
      return {
        draftReply: 'Maaf, gagal membuat saran balasan. Silakan tulis balasan manual.'
      };
    }
  }
}

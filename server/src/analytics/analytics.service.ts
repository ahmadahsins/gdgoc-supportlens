import { Inject, Injectable } from '@nestjs/common';
import { firestore as FirebaseFirestore } from 'firebase-admin';

interface SentimentStats {
  positive: number;
  negative: number;
  neutral: number;
}

interface CategoryStats {
  category: string;
  count: number;
}

export interface AnalyticsResponse {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  avgUrgencyScore: number;
  sentimentStats: SentimentStats;
  topCategories: CategoryStats[];
}

@Injectable()
export class AnalyticsService {
  constructor(@Inject('FIRESTORE') private firestore: FirebaseFirestore.Firestore) { }
  
  async getStats(): Promise<AnalyticsResponse> {
    const ticketRef = this.firestore.collection('tickets');
    const snapshot = await ticketRef.get();

    if (snapshot.empty) {
      return {
        totalTickets: 0,
        openTickets: 0,
        closedTickets: 0,
        avgUrgencyScore: 0,
        sentimentStats: {
          positive: 0,
          negative: 0,
          neutral: 0,
        },
        topCategories: [],
      }
    }

    let openTickets = 0;
    let closedTickets = 0;
    let totalUrgency = 0;
    const sentimentStats: SentimentStats = { positive: 0, negative: 0, neutral: 0 };
    const categoryCount: Record<string, number> = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();

      if (data.status == 'OPEN') {
        openTickets++;
      } else if (data.status == 'CLOSED') {
        closedTickets++;
      }

      if (data.aiAnalysis) {
        if (data.aiAnalysis.urgencyScore) {
          totalUrgency += data.aiAnalysis.urgencyScore;
        }

        const sentiment = data.aiAnalysis.sentiment?.toLowerCase();
        if (sentiment == 'positive') {
          sentimentStats.positive++;
        } else if (sentiment == 'negative') {
          sentimentStats.negative++;
        } else if (sentiment == 'neutral') {
          sentimentStats.neutral++;
        }

        const category = data.aiAnalysis.category || 'Other';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });

    const totalTickets = snapshot.size;
    const avgUrgencyScore = totalTickets > 0 ? Math.round((totalUrgency / totalTickets) * 10) / 10 : 0;

    const topCategories: CategoryStats[] = Object.entries(categoryCount).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      totalTickets,
      openTickets,
      closedTickets,
      avgUrgencyScore,
      sentimentStats,
      topCategories,
    }
  }
}

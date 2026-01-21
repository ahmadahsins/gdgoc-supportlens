'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Clock, Filter, Search, Inbox, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface Ticket {
  id: string;
  senderName: string;
  senderEmail: string;
  initialMessage: string;
  status: 'OPEN' | 'CLOSED';
  aiAnalysis?: {
    category?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    urgencyScore?: number;
    summary?: string;
  };
  createdAt: any;
  messages?: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'OPEN' | 'CLOSED'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [filter, user]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const response = await api.getTickets(params);
      setTickets(response.data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.initialMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.senderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.senderEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (urgencyScore?: number) => {
    if (!urgencyScore) return 'bg-[#5A6650]/20 text-[#5A6650] border-[#5A6650]/30';
    if (urgencyScore >= 8) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (urgencyScore >= 5) return 'bg-[#9FCC2E]/20 text-[#9FCC2E] border-[#9FCC2E]/30';
    return 'bg-[#5A6650]/20 text-[#5A6650] border-[#5A6650]/30';
  };

  const getPriorityLabel = (urgencyScore?: number) => {
    if (!urgencyScore) return 'LOW';
    if (urgencyScore >= 8) return 'URGENT';
    if (urgencyScore >= 5) return 'MEDIUM';
    return 'LOW';
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-[#9FCC2E]/20 text-[#9FCC2E] border-[#9FCC2E]/30';
      case 'neutral': return 'bg-[#5A6650]/20 text-[#5A6650] border-[#5A6650]/30';
      case 'negative': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-[#295135]/20 text-[#5A6650] border-[#295135]/30';
    }
  };

  const openTicketCount = tickets.filter(t => t.status === 'OPEN').length;
  const closedTicketCount = tickets.filter(t => t.status === 'CLOSED').length;

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-[#9FCC2E]/30 rounded-full animate-spin border-t-[#9FCC2E]"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-wide text-[#9FCC2E]" style={{ textShadow: '0 0 20px rgba(159, 204, 46, 0.3)' }}>
              UNIFIED INBOX
            </h1>
            <p className="mt-1 font-mono text-sm tracking-wider text-[#5A6650]">MANAGE ALL CUSTOMER SUPPORT TICKETS</p>
          </div>
          <div className="text-xs font-mono text-[#5A6650]">
            <span className="text-[#9FCC2E]">{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Tickets */}
          <div className="group relative rounded-xl p-6 transition-all duration-300 border bg-linear-to-br from-[#0E402D]/50 to-[#000000] border-[#295135]/50 hover:border-[#9FCC2E]/50 hover:shadow-[0_0_30px_rgba(159,204,46,0.1)]">
            <div className="absolute inset-0 bg-linear-to-br from-[#9FCC2E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-xs font-mono tracking-wider mb-2 text-[#5A6650]">TOTAL.TICKETS</p>
                <p className="text-4xl font-bold text-[#9FCC2E]" style={{ textShadow: '0 0 15px rgba(159, 204, 46, 0.3)' }}>
                  {tickets.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center border bg-[#295135]/50 border-[#9FCC2E]/20">
                <Inbox className="w-6 h-6 text-[#9FCC2E]" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-mono text-[#5A6650]">
              <TrendingUp className="w-3 h-3 mr-1 text-[#9FCC2E]" />
              <span>ALL.TIME</span>
            </div>
          </div>

          {/* Open Tickets */}
          <div className="group relative rounded-xl p-6 transition-all duration-300 border bg-linear-to-br from-[#0E402D]/50 to-[#000000] border-[#295135]/50 hover:border-[#9FCC2E]/50 hover:shadow-[0_0_30px_rgba(159,204,46,0.1)]">
            <div className="absolute inset-0 bg-linear-to-br from-[#9FCC2E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-xs font-mono tracking-wider mb-2 text-[#5A6650]">OPEN.TICKETS</p>
                <p className="text-4xl font-bold text-amber-400" style={{ textShadow: '0 0 15px rgba(251, 191, 36, 0.3)' }}>
                  {openTicketCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center border bg-amber-500/20 border-amber-500/30">
                <AlertCircle className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-mono text-[#5A6650]">
              <div className="w-2 h-2 bg-amber-400 rounded-full mr-2 animate-pulse" />
              <span>REQUIRES.ACTION</span>
            </div>
          </div>

          {/* Closed Tickets */}
          <div className="group relative rounded-xl p-6 transition-all duration-300 border bg-linear-to-br from-[#0E402D]/50 to-[#000000] border-[#295135]/50 hover:border-[#9FCC2E]/50 hover:shadow-[0_0_30px_rgba(159,204,46,0.1)]">
            <div className="absolute inset-0 bg-linear-to-br from-[#9FCC2E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-xs font-mono tracking-wider mb-2 text-[#5A6650]">CLOSED.TICKETS</p>
                <p className="text-4xl font-bold text-[#9FCC2E]" style={{ textShadow: '0 0 15px rgba(159, 204, 46, 0.3)' }}>
                  {closedTicketCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center border bg-[#9FCC2E]/20 border-[#9FCC2E]/30">
                <CheckCircle className="w-6 h-6 text-[#9FCC2E]" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-mono text-[#5A6650]">
              <div className="w-2 h-2 rounded-full mr-2 bg-[#9FCC2E]" />
              <span>RESOLVED</span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="rounded-xl p-6 border bg-linear-to-br from-[#0E402D]/30 to-[#000000] border-[#295135]/50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#5A6650]" />
              <Input
                placeholder="Search tickets by subject, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-[#000000]/50 border-[#295135]/50 text-[#9FCC2E] placeholder:text-[#5A6650] focus:border-[#9FCC2E]/50 focus:ring-[#9FCC2E]/20"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setFilter('all')}
                size="sm"
                className={`h-12 px-6 font-mono tracking-wider transition-all duration-300 ${
                  filter === 'all' 
                    ? 'bg-[#9FCC2E]/20 text-[#9FCC2E] border border-[#9FCC2E]/50 hover:bg-[#9FCC2E]/30'
                    : 'bg-transparent text-[#5A6650] border border-[#295135]/50 hover:text-[#9FCC2E] hover:border-[#9FCC2E]/30'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                ALL
              </Button>
              <Button
                onClick={() => setFilter('OPEN')}
                size="sm"
                className={`h-12 px-6 font-mono tracking-wider transition-all duration-300 ${
                  filter === 'OPEN' 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30' 
                    : 'bg-transparent text-[#5A6650] border border-[#295135]/50 hover:text-amber-400 hover:border-amber-500/30'
                }`}
              >
                OPEN
              </Button>
              <Button
                onClick={() => setFilter('CLOSED')}
                size="sm"
                className={`h-12 px-6 font-mono tracking-wider transition-all duration-300 ${
                  filter === 'CLOSED' 
                    ? 'bg-[#9FCC2E]/20 text-[#9FCC2E] border border-[#9FCC2E]/50 hover:bg-[#9FCC2E]/30'
                    : 'bg-transparent text-[#5A6650] border border-[#295135]/50 hover:text-[#9FCC2E] hover:border-[#9FCC2E]/30'
                }`}
              >
                CLOSED
              </Button>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono tracking-wider text-[#5A6650]">
              DISPLAYING <span className="text-[#9FCC2E]">{filteredTickets.length}</span> RECORDS
            </p>
          </div>

          {loading ? (
            <div className="rounded-xl p-12 text-center border bg-linear-to-br from-[#0E402D]/30 to-[#000000] border-[#295135]/50">
              <div className="relative inline-block">
                <div className="w-12 h-12 border-2 rounded-full animate-spin border-[#9FCC2E]/30 border-t-[#9FCC2E]"></div>
              </div>
              <p className="mt-4 font-mono text-sm text-[#5A6650]">LOADING TICKETS...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="rounded-xl p-12 text-center border bg-linear-to-br from-[#0E402D]/30 to-[#000000] border-[#295135]/50">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[#295135]/30">
                <Inbox className="w-8 h-8 text-[#5A6650]" />
              </div>
              <p className="font-semibold mb-2 text-[#9FCC2E]">NO TICKETS FOUND</p>
              <p className="text-sm font-mono text-[#5A6650]">
                {searchQuery ? 'TRY ADJUSTING YOUR SEARCH QUERY' : 'TICKETS WILL APPEAR HERE WHEN CUSTOMERS CREATE THEM'}
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket, index) => (
              <div
                key={ticket.id}
                className="group relative rounded-xl p-6 transition-all duration-300 cursor-pointer border bg-linear-to-br from-[#0E402D]/30 to-[#000000] border-[#295135]/50 hover:border-[#9FCC2E]/50 hover:shadow-[0_0_30px_rgba(159,204,46,0.1)]"
                onClick={() => router.push(`/tickets/${ticket.id}`)}
              >
                <div className="absolute inset-0 bg-linear-to-br from-[#9FCC2E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="text-xs font-mono text-[#5A6650]">#{String(index + 1).padStart(3, '0')}</span>
                        <h3 className="text-lg font-semibold truncate text-[#9FCC2E]">
                          {ticket.aiAnalysis?.summary || ticket.initialMessage?.substring(0, 50) + '...'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-mono border ${
                          ticket.status === 'OPEN' 
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                            : 'bg-[#9FCC2E]/20 text-[#9FCC2E] border-[#9FCC2E]/30'
                        }`}>
                          {ticket.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-mono border ${getPriorityColor(ticket.aiAnalysis?.urgencyScore)}`}>
                          {getPriorityLabel(ticket.aiAnalysis?.urgencyScore)}
                        </span>
                        {ticket.aiAnalysis?.sentiment && (
                          <span className={`px-3 py-1 rounded-full text-xs font-mono border ${getSentimentColor(ticket.aiAnalysis.sentiment)}`}>
                            {ticket.aiAnalysis.sentiment.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm mb-3 font-mono text-[#5A6650]">
                        {ticket.senderName} • <span className="text-[#9FCC2E]/70">{ticket.senderEmail}</span>
                      </p>
                      <div className="flex items-center text-xs font-mono text-[#5A6650]">
                        <Clock className="w-3 h-3 mr-2 text-[#9FCC2E]" />
                        {ticket.createdAt?.toDate ? formatDistanceToNow(ticket.createdAt.toDate(), { addSuffix: true }).toUpperCase() : 'JUST NOW'}
                      </div>
                    </div>
                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6 text-[#9FCC2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

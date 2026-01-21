'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { ArrowLeft, Send, Sparkles, FileText, Clock, Tag, BarChart3, User, Mail, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  message: string;
  sender: 'customer' | 'agent';
  time: string;
  agentEmail?: string;
  agentRole?: string;
}

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
  messages: Message[];
  createdAt: any;
}

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const ticketId = params?.id as string;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (ticketId && user) {
      loadTicket();
    }
  }, [ticketId, user]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const response = await api.getTicketById(ticketId);
      setTicket(response.data);
    } catch (error) {
      console.error('Error loading ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      setSending(true);
      await api.replyTicket(ticketId, {
        message: replyText,
        sender: 'agent',
      });
      setReplyText('');
      await loadTicket();
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };

  const handleGenerateDraft = async () => {
    try {
      setGenerating(true);
      const response = await api.generateDraft(ticketId, {
        tone: 'professional',
      });
      setReplyText(response.data.draft);
    } catch (error) {
      console.error('Error generating draft:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSummarize = async () => {
    try {
      setSummarizing(true);
      await api.summarizeTicket(ticketId);
      await loadTicket();
    } catch (error) {
      console.error('Error summarizing ticket:', error);
    } finally {
      setSummarizing(false);
    }
  };

  const cardStyle = 'bg-gradient-to-br from-[#0E402D]/50 to-[#000000] border-[#295135]/50';

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-500';
      case 'negative': return 'text-red-500';
      default: return 'text-[#5A6650]';
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9FCC2E]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className={`rounded-xl border p-12 text-center ${cardStyle}`}>
          <p className="text-[#5A6650]">Ticket not found</p>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="mt-4 px-4 py-2 rounded-lg transition-colors bg-[#9FCC2E] text-black hover:bg-[#9FCC2E]/80"
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-lg border transition-colors border-[#295135] hover:bg-[#295135]/50 text-[#9FCC2E]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">
              {ticket.aiAnalysis?.summary || ticket.initialMessage?.substring(0, 100) + '...'}
            </h1>
            <p className="text-sm mt-1 text-[#5A6650]">
              {ticket.senderName} • {ticket.senderEmail}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={ticket.status === 'OPEN' ? 'default' : 'secondary'} className={
              ticket.status === 'OPEN' 
                ? 'bg-[#9FCC2E] text-black'
                : 'bg-[#5A6650] text-white'
            }>
              {ticket.status}
            </Badge>
            {ticket.aiAnalysis?.sentiment && (
              <Badge variant="outline" className={`${getSentimentColor(ticket.aiAnalysis.sentiment)} border-[#295135]`}>
                {ticket.aiAnalysis.sentiment}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Summary */}
            {ticket.aiAnalysis?.summary && (
              <div className={`rounded-xl border p-6 ${cardStyle}`}>
                <h3 className="text-sm font-medium flex items-center gap-2 mb-3 text-[#9FCC2E]">
                  <FileText className="w-4 h-4" />
                  AI Summary
                </h3>
                <p className="text-sm text-[#5A6650]">{ticket.aiAnalysis.summary}</p>
              </div>
            )}

            {/* Chat History */}
            <div className={`rounded-xl border ${cardStyle}`}>
              <div className="p-4 border-b flex items-center justify-between border-[#295135]/50">
                <h3 className="font-semibold text-[#9FCC2E]">Chat History</h3>
                <button
                  onClick={handleSummarize}
                  disabled={summarizing || !!ticket.aiAnalysis?.summary}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50 border border-[#295135] hover:bg-[#295135]/50 text-[#9FCC2E]"
                >
                  <Sparkles className="w-4 h-4" />
                  {summarizing ? 'Summarizing...' : 'Generate Summary'}
                </button>
              </div>
              <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {ticket.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-4 ${
                        message.sender === 'agent'
                          ? 'bg-[#9FCC2E] text-black'
                          : 'bg-[#295135]/50 text-white'
                      }`}
                    >
                      <p className={`text-sm font-medium mb-1 ${
                        message.sender === 'agent'
                          ? 'text-black/70'
                          : 'text-[#9FCC2E]'
                      }`}>
                        {message.sender === 'agent' ? (message.agentEmail || 'Agent') : ticket.senderName}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      <p className={`text-xs mt-2 ${
                        message.sender === 'agent'
                          ? 'text-black/50'
                          : 'text-[#5A6650]'
                      }`}>
                        {message.time ? formatDistanceToNow(new Date(message.time), { addSuffix: true }) : 'Just now'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Box */}
            {ticket.status === 'OPEN' && (
              <div className={`rounded-xl border ${cardStyle}`}>
                <div className="p-4 border-b flex items-center justify-between border-[#295135]/50">
                  <h3 className="font-semibold text-[#9FCC2E]">Reply</h3>
                  <button
                    onClick={handleGenerateDraft}
                    disabled={generating}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50 border border-[#295135] hover:bg-[#295135]/50 text-[#9FCC2E]"
                  >
                    <Sparkles className="w-4 h-4" />
                    {generating ? 'Generating...' : 'Generate Draft'}
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <textarea
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border resize-none focus:outline-none focus:ring-2 bg-[#0E402D]/30 border-[#295135] text-white placeholder-[#5A6650] focus:ring-[#9FCC2E]/50"
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={handleReply} 
                      disabled={sending || !replyText.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 bg-[#9FCC2E] text-black hover:bg-[#9FCC2E]/80"
                    >
                      <Send className="w-4 h-4" />
                      {sending ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Ticket Details */}
            <div className={`rounded-xl border ${cardStyle}`}>
              <div className="p-4 border-b border-[#295135]/50">
                <h3 className="text-sm font-semibold text-[#9FCC2E]">Ticket Details</h3>
              </div>
              <div className="p-4 space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#9FCC2E]/20">
                    <Tag className="w-4 h-4 text-[#9FCC2E]" />
                  </div>
                  <div>
                    <p className="text-[#5A6650]">Status</p>
                    <p className="font-medium capitalize text-white">
                      {ticket.status}
                    </p>
                  </div>
                </div>

                {ticket.aiAnalysis?.urgencyScore && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/20">
                      <BarChart3 className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[#5A6650]">Urgency Score</p>
                      <p className="font-medium text-white">
                        {ticket.aiAnalysis.urgencyScore}/10
                      </p>
                    </div>
                  </div>
                )}

                {ticket.aiAnalysis?.sentiment && (
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      ticket.aiAnalysis.sentiment === 'positive' 
                        ? 'bg-emerald-500/20' 
                        : ticket.aiAnalysis.sentiment === 'negative' 
                          ? 'bg-red-500/20' 
                          : 'bg-[#5A6650]/20'
                    }`}>
                      <MessageSquare className={`w-4 h-4 ${getSentimentColor(ticket.aiAnalysis.sentiment)}`} />
                    </div>
                    <div>
                      <p className="text-[#5A6650]">Sentiment</p>
                      <p className={`font-medium capitalize ${getSentimentColor(ticket.aiAnalysis.sentiment)}`}>
                        {ticket.aiAnalysis.sentiment}
                      </p>
                    </div>
                  </div>
                )}

                {ticket.aiAnalysis?.category && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/20">
                      <FileText className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[#5A6650]">Category</p>
                      <p className="font-medium capitalize text-white">
                        {ticket.aiAnalysis.category}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/20">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[#5A6650]">Created</p>
                    <p className="font-medium text-white">
                      {ticket.createdAt?.toDate 
                        ? formatDistanceToNow(ticket.createdAt.toDate(), { addSuffix: true }) 
                        : 'Just now'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#9FCC2E]/20">
                    <MessageSquare className="w-4 h-4 text-[#9FCC2E]" />
                  </div>
                  <div>
                    <p className="text-[#5A6650]">Messages</p>
                    <p className="font-medium text-white">
                      {ticket.messages.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className={`rounded-xl border ${cardStyle}`}>
              <div className="p-4 border-b border-[#295135]/50">
                <h3 className="text-sm font-semibold text-[#9FCC2E]">Customer Info</h3>
              </div>
              <div className="p-4 space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#9FCC2E]/20">
                    <User className="w-4 h-4 text-[#9FCC2E]" />
                  </div>
                  <div>
                    <p className="text-[#5A6650]">Name</p>
                    <p className="font-medium text-white">
                      {ticket.senderName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#9FCC2E]/20">
                    <Mail className="w-4 h-4 text-[#9FCC2E]" />
                  </div>
                  <div>
                    <p className="text-[#5A6650]">Email</p>
                    <p className="font-medium text-white">
                      {ticket.senderEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

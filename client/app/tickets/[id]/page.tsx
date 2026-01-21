'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  Clock, 
  RefreshCw, 
  Sparkles, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Copy,
  X
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  sender: 'customer' | 'agent';
  message: string;
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
  createdAt: any;
  messages: Message[];
}

interface DraftReply {
  draftReply: string;
  sourceDocument?: string;
  sourceDocuments?: string[];
  ragContextUsed?: boolean;
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;
  const { user, loading: authLoading, role } = useAuth();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [closeOnReply, setCloseOnReply] = useState(false);
  const [sending, setSending] = useState(false);
  
  // AI States
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [regeneratingSummary, setRegeneratingSummary] = useState(false);
  const [draftReply, setDraftReply] = useState<DraftReply | null>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && ticketId) {
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

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    
    try {
      setSending(true);
      await api.replyTicket(ticketId, {
        message: replyMessage,
        closeTicket: closeOnReply,
      });
      
      setReplyMessage('');
      setCloseOnReply(false);
      await loadTicket();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!ticket) return;
    
    try {
      setGeneratingDraft(true);
      // Use the last customer message or initial message as context
      const lastCustomerMessage = [...(ticket.messages || [])]
        .reverse()
        .find(m => m.sender === 'customer')?.message || ticket.initialMessage;
      
      const response = await api.generateDraft(ticketId, {
        contextMessage: lastCustomerMessage,
      });
      
      setDraftReply(response.data);
      setShowDraftModal(true);
    } catch (error) {
      console.error('Error generating draft:', error);
      alert('Failed to generate draft. Make sure the knowledge base has documents uploaded.');
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleRegenerateSummary = async () => {
    try {
      setRegeneratingSummary(true);
      const response = await api.summarizeTicket(ticketId);
      
      // Update ticket with new summary
      setTicket(prev => prev ? {
        ...prev,
        aiAnalysis: {
          ...prev.aiAnalysis,
          summary: response.data.summary,
        }
      } : null);
    } catch (error) {
      console.error('Error regenerating summary:', error);
      alert('Failed to regenerate summary. Please try again.');
    } finally {
      setRegeneratingSummary(false);
    }
  };

  const handleUseDraft = () => {
    if (draftReply) {
      setReplyMessage(draftReply.draftReply);
      setShowDraftModal(false);
    }
  };

  const handleCopyDraft = () => {
    if (draftReply) {
      navigator.clipboard.writeText(draftReply.draftReply);
    }
  };

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

  if (authLoading || loading) {
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

  if (!user || !ticket) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-[#5A6650]">Ticket not found</p>
          <Button 
            onClick={() => router.push('/dashboard')} 
            className="mt-4 bg-[#295135] text-[#9FCC2E] hover:bg-[#0E402D]"
          >
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              size="sm"
              className="bg-transparent border-[#295135]/50 text-[#5A6650] hover:text-[#9FCC2E] hover:border-[#9FCC2E]/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#9FCC2E]" style={{ textShadow: '0 0 20px rgba(159, 204, 46, 0.3)' }}>
                TICKET DETAIL
              </h1>
              <p className="text-xs font-mono text-[#5A6650]">ID: {ticketId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-mono border ${
              ticket.status === 'OPEN' 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                : 'bg-[#9FCC2E]/20 text-[#9FCC2E] border-[#9FCC2E]/30'
            }`}>
              {ticket.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Messages */}
            <div className="rounded-xl border bg-linear-to-br from-[#0E402D]/30 to-[#000000] border-[#295135]/50">
              <div className="p-4 border-b border-[#295135]/50">
                <h2 className="text-sm font-mono text-[#9FCC2E]">CONVERSATION</h2>
              </div>
              <div className="p-4 space-y-4 max-h-125 overflow-y-auto">
                {ticket.messages?.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${msg.sender === 'agent' ? 'order-2' : ''}`}>
                      <div className={`flex items-center gap-2 mb-1 ${msg.sender === 'agent' ? 'justify-end' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          msg.sender === 'agent' 
                            ? 'bg-[#9FCC2E]/20 border border-[#9FCC2E]/30' 
                            : 'bg-[#295135]/50 border border-[#295135]'
                        }`}>
                          {msg.sender === 'agent' ? (
                            <User className="w-3 h-3 text-[#9FCC2E]" />
                          ) : (
                            <User className="w-3 h-3 text-[#5A6650]" />
                          )}
                        </div>
                        <span className="text-xs font-mono text-[#5A6650]">
                          {msg.sender === 'agent' ? (msg.agentEmail?.split('@')[0] || 'Agent') : ticket.senderName}
                        </span>
                        <span className="text-xs text-[#5A6650]/60">
                          {msg.time ? format(new Date(msg.time), 'HH:mm') : ''}
                        </span>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        msg.sender === 'agent'
                          ? 'bg-[#9FCC2E]/10 border border-[#9FCC2E]/30 text-[#9FCC2E]'
                          : 'bg-[#295135]/30 border border-[#295135]/50 text-[#5A6650]'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Box */}
            {ticket.status === 'OPEN' && (
              <div className="rounded-xl border bg-linear-to-br from-[#0E402D]/30 to-[#000000] border-[#295135]/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-mono text-[#9FCC2E]">REPLY</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleGenerateDraft}
                      disabled={generatingDraft}
                      size="sm"
                      className="bg-[#295135] text-[#9FCC2E] hover:bg-[#0E402D] border border-[#9FCC2E]/30 hover:border-[#9FCC2E]/50"
                    >
                      {generatingDraft ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Draft
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <Textarea
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="bg-[#000000]/50 border-[#295135]/50 text-[#9FCC2E] placeholder:text-[#5A6650]/50 focus:border-[#9FCC2E]/50 focus:ring-[#9FCC2E]/20 min-h-30 mb-3"
                />
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={closeOnReply}
                      onChange={(e) => setCloseOnReply(e.target.checked)}
                      className="w-4 h-4 rounded border-[#295135] bg-[#000000] text-[#9FCC2E] focus:ring-[#9FCC2E]/20"
                    />
                    <span className="text-sm text-[#5A6650]">Close ticket after reply</span>
                  </label>
                  
                  <Button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || sending}
                    className="bg-[#9FCC2E] text-[#000000] hover:bg-[#9FCC2E]/80 font-semibold"
                  >
                    {sending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="rounded-xl border bg-linear-to-br from-[#0E402D]/30 to-[#000000] border-[#295135]/50 p-4">
              <h2 className="text-sm font-mono text-[#9FCC2E] mb-4">CUSTOMER INFO</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-mono text-[#5A6650] mb-1">NAME</p>
                  <p className="text-[#9FCC2E]">{ticket.senderName}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-[#5A6650] mb-1">EMAIL</p>
                  <p className="text-[#9FCC2E]">{ticket.senderEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-[#5A6650] mb-1">CREATED</p>
                  <p className="text-[#9FCC2E]">
                    {ticket.createdAt?.toDate 
                      ? format(ticket.createdAt.toDate(), 'PPpp')
                      : ticket.createdAt?._seconds
                        ? format(new Date(ticket.createdAt._seconds * 1000), 'PPpp')
                        : 'Unknown'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="rounded-xl border bg-linear-to-br from-[#0E402D]/30 to-[#000000] border-[#295135]/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-mono text-[#9FCC2E]">AI ANALYSIS</h2>
                <Bot className="w-4 h-4 text-[#9FCC2E]" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-mono text-[#5A6650] mb-1">CATEGORY</p>
                  <p className="text-[#9FCC2E]">{ticket.aiAnalysis?.category || 'Not analyzed'}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-[#5A6650] mb-1">SENTIMENT</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-mono border ${getSentimentColor(ticket.aiAnalysis?.sentiment)}`}>
                    {ticket.aiAnalysis?.sentiment?.toUpperCase() || 'N/A'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-mono text-[#5A6650] mb-1">URGENCY</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-mono border ${getPriorityColor(ticket.aiAnalysis?.urgencyScore)}`}>
                    {ticket.aiAnalysis?.urgencyScore || 0}/10 - {getPriorityLabel(ticket.aiAnalysis?.urgencyScore)}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl border bg-linear-to-br from-[#0E402D]/30 to-[#000000] border-[#295135]/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-mono text-[#9FCC2E]">SUMMARY</h2>
                <Button
                  onClick={handleRegenerateSummary}
                  disabled={regeneratingSummary}
                  size="sm"
                  className="bg-[#295135] text-[#9FCC2E] hover:bg-[#0E402D] border border-[#9FCC2E]/30 hover:border-[#9FCC2E]/50"
                >
                  {regeneratingSummary ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-[#5A6650]">
                {ticket.aiAnalysis?.summary || 'No summary available. Click refresh to generate one.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Draft Reply Modal */}
      {showDraftModal && draftReply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-4 rounded-xl border bg-linear-to-br from-[#0E402D] to-[#000000] border-[#295135]/50 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#295135]/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#9FCC2E]" />
                <h2 className="text-lg font-semibold text-[#9FCC2E]">AI Generated Draft</h2>
              </div>
              <Button
                onClick={() => setShowDraftModal(false)}
                variant="ghost"
                size="sm"
                className="text-[#5A6650] hover:text-[#9FCC2E]"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Source Document */}
              {draftReply.sourceDocument && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#295135]/30 border border-[#295135]/50">
                  <FileText className="w-4 h-4 text-[#9FCC2E]" />
                  <span className="text-xs font-mono text-[#5A6650]">Source:</span>
                  <span className="text-xs font-mono text-[#9FCC2E]">{draftReply.sourceDocument}</span>
                </div>
              )}
              
              {/* Draft Content */}
              <div className="p-4 rounded-lg bg-[#000000]/50 border border-[#295135]/50">
                <p className="text-sm text-[#9FCC2E] whitespace-pre-wrap">{draftReply.draftReply}</p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <Button
                  onClick={handleCopyDraft}
                  variant="outline"
                  className="bg-transparent border-[#295135]/50 text-[#5A6650] hover:text-[#9FCC2E] hover:border-[#9FCC2E]/50"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={handleUseDraft}
                  className="bg-[#9FCC2E] text-[#000000] hover:bg-[#9FCC2E]/80 font-semibold"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Use This Draft
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

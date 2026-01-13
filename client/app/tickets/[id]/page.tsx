'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { ArrowLeft, Send, Sparkles, FileText } from 'lucide-react';
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

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Ticket not found</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.aiAnalysis?.summary || ticket.initialMessage?.substring(0, 100) + '...'}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {ticket.senderName} • {ticket.senderEmail}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={ticket.status === 'OPEN' ? 'default' : 'secondary'}>
              {ticket.status}
            </Badge>
            {ticket.aiAnalysis?.sentiment && (
              <Badge variant="outline">{ticket.aiAnalysis.sentiment}</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Summary */}
            {ticket.aiAnalysis?.summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{ticket.aiAnalysis.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Chat History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Chat History</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSummarize}
                  disabled={summarizing || !!ticket.aiAnalysis?.summary}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {summarizing ? 'Summarizing...' : 'Generate Summary'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.sender === 'agent'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {message.sender === 'agent' ? (message.agentEmail || 'Agent') : ticket.senderName}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      <p className={`text-xs mt-2 ${message.sender === 'agent' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.time ? formatDistanceToNow(new Date(message.time), { addSuffix: true }) : 'Just now'}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Reply Box */}
            {ticket.status === 'OPEN' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Reply</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateDraft}
                    disabled={generating}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {generating ? 'Generating...' : 'Generate Draft'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={6}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleReply} disabled={sending || !replyText.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      {sending ? 'Sending...' : 'Send Reply'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium capitalize">{ticket.status}</p>
                </div>
                {ticket.aiAnalysis?.urgencyScore && (
                  <div>
                    <p className="text-gray-500">Urgency Score</p>
                    <p className="font-medium">{ticket.aiAnalysis.urgencyScore}/10</p>
                  </div>
                )}
                {ticket.aiAnalysis?.sentiment && (
                  <div>
                    <p className="text-gray-500">Sentiment</p>
                    <p className="font-medium capitalize">{ticket.aiAnalysis.sentiment}</p>
                  </div>
                )}
                {ticket.aiAnalysis?.category && (
                  <div>
                    <p className="text-gray-500">Category</p>
                    <p className="font-medium capitalize">{ticket.aiAnalysis.category}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium">
                    {ticket.createdAt?.toDate ? formatDistanceToNow(ticket.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Messages</p>
                  <p className="font-medium">{ticket.messages.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Customer Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{ticket.senderName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{ticket.senderEmail}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

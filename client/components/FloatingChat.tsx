'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { MessageSquare, Send, X, Minimize2, Maximize2 } from 'lucide-react';

interface FloatingChatProps {
  className?: string;
}

export default function FloatingChat({ className }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerEmail || !subject || !message) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.createTicket({
        name: customerName,
        email: customerEmail,
        message: `${subject}\n\n${message}`,
      });
      
      setTicketId(response.data.id);
      setSubmitted(true);
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCustomerName('');
    setCustomerEmail('');
    setSubject('');
    setMessage('');
    setSubmitted(false);
    setTicketId('');
  };

  const handleClose = () => {
    setIsOpen(false);
    handleReset();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#295135] to-[#0E402D] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border border-[#9FCC2E]/50 group hover:scale-110 ${className}`}
        aria-label="Open chat"
      >
        <MessageSquare className="w-6 h-6 text-[#9FCC2E] group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#9FCC2E] rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-72' : 'w-96'} transition-all duration-300 ${className}`}
    >
      <div className="bg-gradient-to-br from-[#0E402D]/95 to-[#000000]/95 backdrop-blur-xl rounded-2xl border border-[#295135]/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#295135]/50 bg-[#0E402D]/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#9FCC2E]/20 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-[#9FCC2E]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#9FCC2E] text-sm">Customer Support</h3>
              <p className="text-[#5A6650] text-xs">We're here to help!</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-[#295135]/50 rounded-lg transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-[#5A6650] hover:text-[#9FCC2E]" />
              ) : (
                <Minimize2 className="w-4 h-4 text-[#5A6650] hover:text-[#9FCC2E]" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-[#295135]/50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-[#5A6650] hover:text-red-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-4 max-h-[500px] overflow-y-auto">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#5A6650] text-xs font-mono tracking-wider mb-1.5">
                      NAME *
                    </label>
                    <Input
                      placeholder="John Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="bg-[#000000]/50 border-[#295135]/50 text-[#9FCC2E] placeholder:text-[#5A6650]/50 focus:border-[#9FCC2E]/50 focus:ring-[#9FCC2E]/20 h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5A6650] text-xs font-mono tracking-wider mb-1.5">
                      EMAIL *
                    </label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      className="bg-[#000000]/50 border-[#295135]/50 text-[#9FCC2E] placeholder:text-[#5A6650]/50 focus:border-[#9FCC2E]/50 focus:ring-[#9FCC2E]/20 h-9 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#5A6650] text-xs font-mono tracking-wider mb-1.5">
                    SUBJECT *
                  </label>
                  <Input
                    placeholder="Brief description"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="bg-[#000000]/50 border-[#295135]/50 text-[#9FCC2E] placeholder:text-[#5A6650]/50 focus:border-[#9FCC2E]/50 focus:ring-[#9FCC2E]/20 h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[#5A6650] text-xs font-mono tracking-wider mb-1.5">
                    MESSAGE *
                  </label>
                  <Textarea
                    placeholder="Describe your issue..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="bg-[#000000]/50 border-[#295135]/50 text-[#9FCC2E] placeholder:text-[#5A6650]/50 focus:border-[#9FCC2E]/50 focus:ring-[#9FCC2E]/20 resize-none min-h-[100px] text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-[#295135] hover:bg-[#0E402D] text-[#9FCC2E] border border-[#9FCC2E]/30 hover:border-[#9FCC2E] transition-all duration-300 font-semibold tracking-wider text-sm"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#9FCC2E]/30 border-t-[#9FCC2E] rounded-full animate-spin mr-2"></div>
                      PROCESSING...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      SUBMIT TICKET
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#9FCC2E]/20 rounded-full flex items-center justify-center border border-[#9FCC2E]/50">
                  <svg
                    className="w-6 h-6 text-[#9FCC2E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#9FCC2E] mb-2">
                  Ticket Submitted!
                </h3>
                <p className="text-[#5A6650] text-sm mb-4">
                  Our team will get back to you soon.
                </p>
                <div className="bg-[#000000]/50 rounded-lg p-3 mb-4 border border-[#295135]/50">
                  <p className="text-[#5A6650] text-xs font-mono mb-1">TICKET ID</p>
                  <p className="text-base font-mono font-bold text-[#9FCC2E]">
                    {ticketId}
                  </p>
                </div>
                <Button 
                  onClick={handleReset} 
                  variant="outline"
                  className="text-sm bg-transparent border border-[#9FCC2E]/50 text-[#9FCC2E] hover:bg-[#9FCC2E]/10 hover:border-[#9FCC2E]"
                >
                  Submit Another Ticket
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

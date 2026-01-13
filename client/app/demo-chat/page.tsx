'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';

// Particle field background
const ParticleField = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(25)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-[#9FCC2E] rounded-full opacity-20"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`,
        }}
      />
    ))}
  </div>
);

export default function DemoChatPage() {
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

  return (
    <div className="h-screen bg-[#000000] relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(-45deg, #000000, #0E402D, #295135, #0E402D)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        opacity: 0.3
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(159, 204, 46, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(159, 204, 46, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }} />
      <ParticleField />

      {/* Decorative corners */}
      <div className="fixed top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-[#295135]/30 pointer-events-none" />
      <div className="fixed top-0 right-0 w-24 h-24 border-r-2 border-t-2 border-[#295135]/30 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-24 h-24 border-l-2 border-b-2 border-[#295135]/30 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-[#295135]/30 pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col max-w-3xl mx-auto w-full py-8 px-4">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-[#5A6650] hover:text-[#9FCC2E] transition-colors mb-4 group shrink-0">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-mono tracking-wider">BACK TO HOME</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-4 shrink-0">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#9FCC2E]/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-14 h-14 bg-linear-to-br from-[#0E402D] to-[#000000] rounded-full border border-[#9FCC2E]/50 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-[#9FCC2E]" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#9FCC2E] mb-2 tracking-wide" style={{ textShadow: '0 0 20px rgba(159, 204, 46, 0.3)' }}>
            CUSTOMER SUPPORT
          </h1>
          <p className="text-[#5A6650] text-sm max-w-md mx-auto">
            Need help? Send us a message and our AI-powered team will get back to you soon!
          </p>
        </div>

        {/* Main Content - Flex grow to fill remaining space */}
        <div className="flex-1 flex flex-col min-h-0">
          {!submitted ? (
            <div className="bg-linear-to-br from-[#0E402D]/50 to-[#000000] border border-[#295135]/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(159,204,46,0.05)] flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-4 shrink-0">
                <div className="w-2 h-2 bg-[#9FCC2E] rounded-full animate-pulse" />
                <h2 className="text-[#9FCC2E] font-semibold tracking-wider text-sm">SUBMIT A SUPPORT TICKET</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                  <div>
                    <label className="block text-[#5A6650] text-xs font-mono tracking-wider mb-2">
                      YOUR NAME *
                    </label>
                    <Input
                      placeholder="John Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="bg-[#000000]/50 border-[#295135]/50 text-[#9FCC2E] placeholder:text-[#5A6650]/50 focus:border-[#9FCC2E]/50 focus:ring-[#9FCC2E]/20 h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5A6650] text-xs font-mono tracking-wider mb-2">
                      EMAIL ADDRESS *
                    </label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      className="bg-[#000000]/50 border-[#295135]/50 text-[#9FCC2E] placeholder:text-[#5A6650]/50 focus:border-[#9FCC2E]/50 focus:ring-[#9FCC2E]/20 h-10"
                    />
                  </div>
                </div>

                <div className="shrink-0">
                  <label className="block text-[#5A6650] text-xs font-mono tracking-wider mb-2">
                    SUBJECT *
                  </label>
                  <Input
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="bg-[#000000]/50 border-[#295135]/50 text-[#9FCC2E] placeholder:text-[#5A6650]/50 focus:border-[#9FCC2E]/50 focus:ring-[#9FCC2E]/20 h-10"
                  />
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <label className="block text-[#5A6650] text-xs font-mono tracking-wider mb-2 shrink-0">
                    MESSAGE *
                  </label>
                  <Textarea
                    placeholder="Please describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="bg-[#000000]/50 border-[#295135]/50 text-[#9FCC2E] placeholder:text-[#5A6650]/50 focus:border-[#9FCC2E]/50 focus:ring-[#9FCC2E]/20 resize-none flex-1 min-h-25"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#295135] hover:bg-[#0E402D] text-[#9FCC2E] border border-[#9FCC2E]/30 hover:border-[#9FCC2E] transition-all duration-300 font-semibold tracking-wider group relative overflow-hidden shrink-0"
                  disabled={submitting}
                >
                  <span className="absolute inset-0 bg-linear-to-r from-transparent via-[#9FCC2E]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#9FCC2E]/30 border-t-[#9FCC2E] rounded-full animate-spin mr-3"></div>
                      PROCESSING...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      SUBMIT TICKET
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="bg-linear-to-br from-[#0E402D]/50 to-[#000000] border border-[#9FCC2E]/50 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(159,204,46,0.1)] flex-1 flex flex-col justify-center">
              <div className="relative inline-block mb-4 mx-auto">
                <div className="absolute inset-0 bg-[#9FCC2E]/20 rounded-full blur-xl animate-pulse" />
                <div className="relative w-16 h-16 bg-[#9FCC2E]/20 rounded-full flex items-center justify-center border border-[#9FCC2E]/50">
                  <svg
                    className="w-8 h-8 text-[#9FCC2E]"
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
              </div>
              <h2 className="text-xl font-bold text-[#9FCC2E] mb-3 tracking-wide" style={{ textShadow: '0 0 15px rgba(159, 204, 46, 0.3)' }}>
                TICKET SUBMITTED SUCCESSFULLY!
              </h2>
              <p className="text-[#5A6650] mb-6 text-sm">
                Your ticket has been created. Our support team will review it and get back to you soon.
              </p>
              <div className="bg-[#000000]/50 rounded-xl p-4 mb-6 border border-[#295135]/50 max-w-xs mx-auto">
                <p className="text-[#5A6650] text-xs font-mono tracking-wider mb-1">TICKET.ID</p>
                <p className="text-xl font-mono font-bold text-[#9FCC2E]" style={{ textShadow: '0 0 10px rgba(159, 204, 46, 0.3)' }}>
                  {ticketId}
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-[#5A6650]">
                  Confirmation sent to <span className="text-[#9FCC2E]">{customerEmail}</span>
                </p>
                <Button 
                  onClick={handleReset} 
                  className="bg-transparent border border-[#9FCC2E]/50 text-[#9FCC2E] hover:bg-[#9FCC2E]/10 hover:border-[#9FCC2E] transition-all duration-300 tracking-wider"
                >
                  SUBMIT ANOTHER TICKET
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

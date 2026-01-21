'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

// Hexagonal logo component
const HexLogo = () => (
  <div className="relative w-20 h-20">
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id="hexGradientLogin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9FCC2E" />
          <stop offset="100%" stopColor="#295135" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <polygon
        points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
        fill="none"
        stroke="url(#hexGradientLogin)"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <polygon
        points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5"
        fill="rgba(159, 204, 46, 0.1)"
        stroke="#9FCC2E"
        strokeWidth="1"
        opacity="0.5"
      />
      <circle cx="50" cy="50" r="18" fill="none" stroke="#9FCC2E" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="10" fill="#9FCC2E" opacity="0.8" />
      <circle cx="50" cy="50" r="4" fill="#000" />
    </svg>
  </div>
);

// Animated particles
const ParticleField = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(30)].map((_, i) => (
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

// Background glitch codes
const GlitchCodes = () => {
  const [codes, setCodes] = useState<string[]>([]);
  
  useEffect(() => {
    // Generate initial codes
    const generateCodes = () => {
      return [...Array(12)].map(() => 
        Math.random().toString(16).substr(2, 6).toUpperCase()
      );
    };
    setCodes(generateCodes());

    // Randomly update codes to create glitch effect
    const interval = setInterval(() => {
      setCodes(prev => {
        const newCodes = [...prev];
        // Randomly change 2-3 codes
        const changCount = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < changCount; i++) {
          const idx = Math.floor(Math.random() * newCodes.length);
          newCodes[idx] = Math.random().toString(16).substr(2, 6).toUpperCase();
        }
        return newCodes;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Large background codes with glitch animation */}
      <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-8 p-8 opacity-[0.07]">
        {codes.map((code, i) => (
          <div
            key={i}
            className="text-6xl md:text-8xl lg:text-9xl font-mono font-bold text-[#9FCC2E]"
            style={{
              animation: `glitch ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              textShadow: '0 0 30px rgba(159, 204, 46, 0.5)',
            }}
          >
            {code}
          </div>
        ))}
      </div>
      {/* Scanline overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />
    </div>
  );
};

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-[#9FCC2E]/30 rounded-full animate-spin border-t-[#9FCC2E]"></div>
            <div className="absolute inset-0 w-16 h-16 border-2 border-[#295135]/20 rounded-full animate-ping"></div>
          </div>
          <p className="mt-4 text-[#5A6650] font-mono text-sm tracking-wider">INITIALIZING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-animated opacity-30" style={{
        background: 'linear-gradient(-45deg, #000000, #0E402D, #295135, #0E402D)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(159, 204, 46, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(159, 204, 46, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }} />
      <ParticleField />
      
      {/* Large Glitching Background Codes */}
      <GlitchCodes />

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#295135]/30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[#295135]/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[#295135]/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#295135]/30" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-linear-to-br from-[#0E402D]/80 to-[#000000]/90 backdrop-blur-xl border border-[#295135]/50 rounded-2xl p-8 shadow-[0_0_50px_rgba(159,204,46,0.1)]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <HexLogo />
            </div>
            <h1 className="text-3xl font-bold text-[#9FCC2E] mb-2 tracking-wider" style={{
              textShadow: '0 0 20px rgba(159, 204, 46, 0.5)'
            }}>
              SUPPORTLENS
            </h1>
            <div className="w-16 h-0.5 bg-linear-to-r from-transparent via-[#9FCC2E] to-transparent mx-auto mb-4" />
            <p className="text-[#5A6650] text-sm tracking-wide">
              AI-Powered Intelligence Platform
            </p>
          </div>

          {/* System Status */}
          <div className="mb-8 p-4 bg-[#000000]/50 rounded-lg border border-[#295135]/30">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#5A6650]">SYS.STATUS</span>
              <span className="flex items-center text-[#9FCC2E]">
                <span className="w-2 h-2 bg-[#9FCC2E] rounded-full mr-2 animate-pulse" />
                READY
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono mt-2">
              <span className="text-[#5A6650]">AUTH.PROTOCOL</span>
              <span className="text-[#9FCC2E]">OAUTH 2.0</span>
            </div>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleGoogleSignIn}
            className="w-full h-14 text-base bg-[#295135] hover:bg-[#0E402D] text-[#9FCC2E] border border-[#9FCC2E]/30 hover:border-[#9FCC2E] transition-all duration-300 group relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-linear-to-r from-transparent via-[#9FCC2E]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#9FCC2E"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#9FCC2E"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#5A6650"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#5A6650"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="tracking-wider font-semibold">AUTHENTICATE WITH GOOGLE</span>
          </Button>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link href="/" className="text-[#5A6650] text-sm hover:text-[#9FCC2E] transition-colors tracking-wide">
              ← Return to Home
            </Link>
          </div>
        </div>

        {/* Version info */}
        <div className="text-center mt-6 text-[#295135] text-xs font-mono">
          v2.0.26 | © 2026 SUPPORTLENS
        </div>
      </div>
    </div>
  );
}

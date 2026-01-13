'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

// Animated background particles
const ParticleField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
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
};

// Wireframe 3D shape component
const WireframeBrain = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 200 200"
    className={`${className} wireframe-glow`}
    fill="none"
    stroke="#9FCC2E"
    strokeWidth="0.5"
  >
    {/* Brain-like wireframe shape */}
    <ellipse cx="100" cy="100" rx="80" ry="60" opacity="0.3" />
    <ellipse cx="100" cy="100" rx="60" ry="45" opacity="0.4" />
    <ellipse cx="100" cy="100" rx="40" ry="30" opacity="0.5" />
    <path d="M20 100 Q60 60 100 100 Q140 140 180 100" opacity="0.3" />
    <path d="M20 100 Q60 140 100 100 Q140 60 180 100" opacity="0.3" />
    <circle cx="100" cy="100" r="5" fill="#9FCC2E" opacity="0.8" />
    {/* Neural connections */}
    {[...Array(12)].map((_, i) => (
      <line
        key={i}
        x1="100"
        y1="100"
        x2={100 + Math.cos((i * 30 * Math.PI) / 180) * 70}
        y2={100 + Math.sin((i * 30 * Math.PI) / 180) * 50}
        opacity="0.2"
      />
    ))}
    {[...Array(12)].map((_, i) => (
      <circle
        key={`node-${i}`}
        cx={100 + Math.cos((i * 30 * Math.PI) / 180) * 70}
        cy={100 + Math.sin((i * 30 * Math.PI) / 180) * 50}
        r="3"
        fill="#9FCC2E"
        opacity="0.6"
      />
    ))}
  </svg>
);

// Hexagonal logo component
const HexLogo = () => (
  <div className="relative w-16 h-16">
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9FCC2E" />
          <stop offset="100%" stopColor="#295135" />
        </linearGradient>
      </defs>
      <polygon
        points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
        fill="none"
        stroke="url(#hexGradient)"
        strokeWidth="2"
      />
      <polygon
        points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5"
        fill="rgba(159, 204, 46, 0.1)"
        stroke="#9FCC2E"
        strokeWidth="1"
        opacity="0.5"
      />
      {/* Inner eye/lens symbol */}
      <circle cx="50" cy="50" r="15" fill="none" stroke="#9FCC2E" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="8" fill="#9FCC2E" opacity="0.8" />
      <circle cx="50" cy="50" r="3" fill="#000" />
    </svg>
  </div>
);

// Data stream visualization
const DataStream = () => (
  <div className="absolute right-0 top-0 w-64 h-full opacity-30 overflow-hidden pointer-events-none hidden lg:block">
    <div className="font-mono text-xs text-[#9FCC2E] space-y-1">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="opacity-50"
          style={{
            animationName: 'dataStream',
            animationDuration: `${2 + Math.random() * 3}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        >
          {Math.random().toString(16).substr(2, 8).toUpperCase()}
        </div>
      ))}
    </div>
  </div>
);

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-screen bg-[#000000] overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-animated opacity-50" />
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute inset-0 hex-pattern opacity-30" />
      <ParticleField />

      {/* Hero Section - Full Screen */}
      <section className="relative h-full flex flex-col items-center justify-center px-4 lg:px-12">
        <DataStream />
        
        {/* Logo at top */}
        <div className="absolute top-6 left-6 lg:left-12 z-50">
          <Link href="/" className="flex items-center gap-3 group">
            <HexLogo />
            <span className="text-[#9FCC2E] font-bold text-xl tracking-wider glow-text">
              SUPPORTLENS
            </span>
          </Link>
        </div>

        <div className="text-center max-w-5xl mx-auto relative z-10">
          {/* Main Title */}
          <div className={`mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <p className="text-[#5A6650] text-sm tracking-[0.3em] uppercase mb-4 font-mono">
              AI-POWERED INTELLIGENCE
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#9FCC2E] mb-6 glow-text tracking-tight">
              SUPPORT
              <span className="block text-[#5A6650]">LENS</span>
            </h1>
            <div className="w-24 h-0.5 bg-linear-to-r from-transparent via-[#9FCC2E] to-transparent mx-auto mb-8" />
            <p className="text-[#5A6650] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Harness the power of artificial intelligence to revolutionize your customer support. 
              <span className="text-[#9FCC2E]"> Intelligent. Fast. Precise.</span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className={`mt-12 flex flex-col sm:flex-row gap-6 justify-center transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Link href="/demo-chat">
              <Button 
                size="lg" 
                className="bg-[#295135] hover:bg-[#0E402D] text-[#9FCC2E] px-12 py-6 text-lg font-semibold tracking-wider border border-[#9FCC2E]/30 hover:border-[#9FCC2E] transition-all duration-500 glow-border btn-futuristic group"
              >
                <span className="flex items-center gap-3">
                  ENTER THE NEXUS
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                variant="outline"
                size="lg"
                className="border-[#9FCC2E]/50 text-[#9FCC2E] hover:bg-[#9FCC2E]/10 hover:border-[#9FCC2E] px-10 py-6 text-lg font-semibold tracking-wider transition-all duration-300"
              >
                ADMIN ACCESS
              </Button>
            </Link>
          </div>
        </div>

        {/* 3D Wireframe Shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-[5%] top-[20%] w-48 h-48 float-animation">
            <WireframeBrain className="w-full h-full opacity-40" />
          </div>
          <div className="absolute right-[10%] top-[15%] w-64 h-64 float-animation-delayed">
            <WireframeBrain className="w-full h-full opacity-30" />
          </div>
          <div className="absolute left-[15%] bottom-[10%] w-40 h-40 float-animation-slow">
            <WireframeBrain className="w-full h-full opacity-20" />
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="absolute bottom-8 left-0 right-0 px-4 lg:px-12">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-8 md:gap-16 text-center">
            {[
              { value: '99.9%', label: 'UPTIME' },
              { value: '<1s', label: 'RESPONSE' },
              { value: '10K+', label: 'TICKETS' },
              { value: '95%', label: 'ACCURACY' },
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="text-xl md:text-2xl font-bold text-[#9FCC2E] glow-text group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-[#5A6650] text-xs tracking-wider font-mono">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative corner elements */}
      <div className="fixed top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#295135]/20 pointer-events-none" />
      <div className="fixed top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[#295135]/20 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[#295135]/20 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#295135]/20 pointer-events-none" />
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import FloatingChat from '@/components/FloatingChat';
import { 
  LayoutDashboard, 
  BarChart3, 
  Database, 
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Hexagonal logo component
const HexLogo = () => (
  <div className="relative w-8 h-8">
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id="hexGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9FCC2E" />
          <stop offset="100%" stopColor="#295135" />
        </linearGradient>
      </defs>
      <polygon
        points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
        fill="none"
        stroke="url(#hexGradientSmall)"
        strokeWidth="3"
      />
      <circle cx="50" cy="50" r="15" fill="none" stroke="#9FCC2E" strokeWidth="2" />
      <circle cx="50" cy="50" r="6" fill="#9FCC2E" />
    </svg>
  </div>
);

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, signOut, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Navigation items
  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, allowedRoles: ['agent', 'admin'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, allowedRoles: ['admin'] },
    { name: 'Knowledge Base', href: '/settings/kb', icon: Database, allowedRoles: ['admin'] },
  ];

  const navigation = allNavigation.filter(item => 
    item.allowedRoles.includes(role || 'agent')
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="relative">
          <div className="w-16 h-16 border-2 rounded-full animate-spin border-[#9FCC2E]/30 border-t-[#9FCC2E]"></div>
          <div className="absolute inset-0 w-16 h-16 border-2 rounded-full animate-ping border-[#295135]/20"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen relative bg-[#000000]">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(159, 204, 46, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(159, 204, 46, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 backdrop-blur-xl border-r transform transition-all duration-300 ease-in-out lg:translate-x-0 bg-linear-to-b from-[#0E402D]/90 to-[#000000] border-[#295135]/50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-[#295135]/50">
            <Link href="/" className="flex items-center space-x-3 group">
              <HexLogo />
              <span className="text-lg font-bold tracking-wider text-[#9FCC2E] group-hover:text-shadow-glow transition-all">
                SUPPORTLENS
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-[#9FCC2E]/70 hover:text-[#9FCC2E] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <p className="text-xs font-mono tracking-wider px-4 mb-4 text-[#5A6650]">NAVIGATION</p>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 group ${
                    isActive
                      ? 'bg-[#9FCC2E]/10 text-[#9FCC2E] border border-[#9FCC2E]/30 shadow-[0_0_15px_rgba(159,204,46,0.2)]'
                      : 'text-[#5A6650] hover:text-[#9FCC2E] hover:bg-[#295135]/30 border border-transparent'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-5 h-5 mr-3 transition-all ${
                    isActive ? 'text-[#9FCC2E]' : 'group-hover:text-[#9FCC2E]'
                  }`} />
                  <span className="tracking-wide">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full animate-pulse bg-[#9FCC2E]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-[#295135]/50">
            {/* User Info */}
            <div className="flex items-center mb-4 p-3 rounded-lg border bg-[#0E402D]/50 border-[#295135]/30">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg border border-[#9FCC2E]/30 bg-[#295135]/50 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#9FCC2E]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 bg-[#9FCC2E] border-[#0E402D]" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-[#9FCC2E]">
                  {user.displayName}
                </p>
                <p className="text-xs truncate font-mono text-[#5A6650]">{role?.toUpperCase() || 'AGENT'}</p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full justify-start bg-transparent border-[#295135]/50 text-[#5A6650] hover:text-[#9FCC2E] hover:bg-[#295135]/30 hover:border-[#9FCC2E]/50 transition-all duration-300"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl border-b bg-[#000000]/80 border-[#295135]/30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#9FCC2E]/70 hover:text-[#9FCC2E] transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:block hidden">
              <div className="flex items-center text-xs font-mono text-[#5A6650]">
                <div className="w-2 h-2 rounded-full mr-2 animate-pulse bg-[#9FCC2E]" />
                SYS.STATUS: <span className="ml-1 text-[#9FCC2E]">ACTIVE</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[#5A6650]">
                Welcome, <span className="font-medium text-[#9FCC2E]">{user.displayName?.split(' ')[0]}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden bg-[#000000]/80"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Decorative corner elements */}
      <div className="fixed top-0 right-0 w-24 h-24 border-r border-t pointer-events-none border-[#295135]/20" />
      <div className="fixed bottom-0 right-0 w-24 h-24 border-r border-b pointer-events-none border-[#295135]/20" />

      {/* Floating Chat Button */}
      <FloatingChat />
    </div>
  );
}

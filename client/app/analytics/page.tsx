'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock, Shield } from 'lucide-react';

interface AnalyticsData {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  avgResponseTime: number;
  sentimentStats: {
    positive: number;
    neutral: number;
    negative: number;
  };
  priorityStats: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  dailyTickets: Array<{
    date: string;
    count: number;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
  }>;
}

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#6b7280',
  negative: '#ef4444',
};

const PRIORITY_COLORS = {
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#dc2626',
};

export default function AnalyticsPage() {
  const { user, loading: authLoading, role } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && role === 'admin') {
      loadAnalytics();
    }
  }, [authLoading, user, role]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAnalytics();
      setAnalytics(response.data);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      setError(error.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9FCC2E]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="rounded-xl border p-16 text-center bg-gradient-to-br from-[#0E402D]/30 to-[#000000] border-[#295135]/50">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500/20">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2 text-[#9FCC2E]">Access Denied</h2>
              <p className="text-[#5A6650]">
                Only admin users can access the Analytics page.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border p-12 text-center bg-gradient-to-br from-[#0E402D]/30 to-[#000000] border-[#295135]/50">
          <p className="text-[#5A6650]">{error}</p>
          <button 
            onClick={loadAnalytics}
            className="mt-4 px-4 py-2 rounded-md transition-colors bg-[#295135] text-[#9FCC2E] hover:bg-[#9FCC2E]/20"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border p-12 text-center bg-gradient-to-br from-[#0E402D]/30 to-[#000000] border-[#295135]/50">
          <p className="text-[#5A6650]">No analytics data available</p>
        </div>
      </DashboardLayout>
    );
  }

  const sentimentData = [
    { name: 'Positive', value: analytics.sentimentStats?.positive ?? 0, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: analytics.sentimentStats?.neutral ?? 0, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: analytics.sentimentStats?.negative ?? 0, color: SENTIMENT_COLORS.negative },
  ];

  const priorityData = [
    { name: 'Low', value: analytics.priorityStats?.low ?? 0 },
    { name: 'Medium', value: analytics.priorityStats?.medium ?? 0 },
    { name: 'High', value: analytics.priorityStats?.high ?? 0 },
    { name: 'Urgent', value: analytics.priorityStats?.urgent ?? 0 },
  ];

  const resolutionRate = analytics.totalTickets > 0 
    ? ((analytics.closedTickets / analytics.totalTickets) * 100).toFixed(1)
    : 0;

  const cardStyle = 'bg-gradient-to-br from-[#0E402D]/50 to-[#000000] border-[#295135]/50';

  const chartTextColor = '#9FCC2E';
  const chartGridColor = '#295135';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-wide text-[#9FCC2E]" style={{ textShadow: '0 0 20px rgba(159, 204, 46, 0.3)' }}>
            ANALYTICS DASHBOARD
          </h1>
          <p className="mt-1 font-mono text-sm tracking-wider text-[#5A6650]">OVERVIEW OF SUPPORT TICKET METRICS AND TRENDS</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Tickets */}
          <div className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-lg ${cardStyle}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5A6650]">Total Tickets</p>
                <p className="text-3xl font-bold mt-2 text-[#9FCC2E]">
                  {analytics.totalTickets}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#9FCC2E]/20">
                <Activity className="w-6 h-6 text-[#9FCC2E]" />
              </div>
            </div>
          </div>

          {/* Open Tickets */}
          <div className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-lg ${cardStyle}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5A6650]">Open Tickets</p>
                <p className="text-3xl font-bold text-amber-500 mt-2">
                  {analytics.openTickets}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-500/20">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Resolution Rate */}
          <div className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-lg ${cardStyle}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5A6650]">Resolution Rate</p>
                <p className="text-3xl font-bold text-emerald-500 mt-2">
                  {resolutionRate}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/20">
                <TrendingDown className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Avg Response Time */}
          <div className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-lg ${cardStyle}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5A6650]">Avg Response Time</p>
                <p className="text-3xl font-bold text-purple-500 mt-2">
                  {analytics.avgResponseTime}h
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-500/20">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Tickets Trend */}
          <div className={`rounded-xl border p-6 ${cardStyle}`}>
            <h3 className="text-lg font-semibold mb-4 text-[#9FCC2E]">Daily Tickets Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyTickets}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="date" stroke={chartTextColor} fontSize={12} />
                <YAxis stroke={chartTextColor} fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0E402D',
                    border: '1px solid #295135',
                    borderRadius: '8px',
                    color: '#9FCC2E'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#9FCC2E"
                  strokeWidth={2}
                  name="Tickets"
                  dot={{ fill: '#9FCC2E' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sentiment Distribution */}
          <div className={`rounded-xl border p-6 ${cardStyle}`}>
            <h3 className="text-lg font-semibold mb-4 text-[#9FCC2E]">Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0E402D',
                    border: '1px solid #295135',
                    borderRadius: '8px',
                    color: '#9FCC2E'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution */}
          <div className={`rounded-xl border p-6 ${cardStyle}`}>
            <h3 className="text-lg font-semibold mb-4 text-[#9FCC2E]">Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="name" stroke={chartTextColor} fontSize={12} />
                <YAxis stroke={chartTextColor} fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0E402D',
                    border: '1px solid #295135',
                    borderRadius: '8px',
                    color: '#9FCC2E'
                  }}
                />
                <Legend />
                <Bar dataKey="value" name="Tickets">
                  {priorityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PRIORITY_COLORS[entry.name.toLowerCase() as keyof typeof PRIORITY_COLORS]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Stats */}
          {analytics.categoryStats && analytics.categoryStats.length > 0 && (
            <div className={`rounded-xl border p-6 ${cardStyle}`}>
              <h3 className="text-lg font-semibold mb-4 text-[#9FCC2E]">Tickets by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.categoryStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis type="number" stroke={chartTextColor} fontSize={12} />
                  <YAxis dataKey="category" type="category" width={100} stroke={chartTextColor} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0E402D',
                      border: '1px solid #295135',
                      borderRadius: '8px',
                      color: '#9FCC2E'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#9FCC2E" name="Tickets" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className={`rounded-xl border p-6 ${cardStyle}`}>
          <h3 className="text-lg font-semibold mb-4 text-[#9FCC2E]">Summary Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#9FCC2E]">
                {analytics.totalTickets}
              </p>
              <p className="text-sm mt-1 text-[#5A6650]">Total Tickets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500">{analytics.closedTickets}</p>
              <p className="text-sm mt-1 text-[#5A6650]">Closed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">{analytics.openTickets}</p>
              <p className="text-sm mt-1 text-[#5A6650]">Open</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{resolutionRate}%</p>
              <p className="text-sm mt-1 text-[#5A6650]">Resolution Rate</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

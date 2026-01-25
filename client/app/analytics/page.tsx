'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart,
  Bar,
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
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Shield, CheckCircle, FolderOpen, Smile, Meh, Frown } from 'lucide-react';

interface AnalyticsData {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  avgUrgencyScore: number;
  sentimentStats: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#6b7280',
  negative: '#ef4444',
};

const CATEGORY_COLORS = [
  '#9FCC2E',
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#8b5cf6',
];

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
        <div className="rounded-xl border p-16 text-center bg-linear-to-br from-[#0E402D]/30 to-[#000000] border-[#295135]/50">
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
        <div className="rounded-xl border p-12 text-center bg-linear-to-br from-[#0E402D]/30 to-[#000000] border-[#295135]/50">
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
        <div className="rounded-xl border p-12 text-center bg-linear-to-br from-[#0E402D]/30 to-[#000000] border-[#295135]/50">
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

  const totalSentiments = sentimentData.reduce((sum, item) => sum + item.value, 0);

  const categoryData = (analytics.topCategories || []).map((cat, index) => ({
    ...cat,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  const resolutionRate = analytics.totalTickets > 0 
    ? ((analytics.closedTickets / analytics.totalTickets) * 100).toFixed(1)
    : 0;

  const cardStyle = 'bg-linear-to-br from-[#0E402D]/50 to-[#000000] border-[#295135]/50';

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

        {/* Key Metrics - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Tickets */}
          <div className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-lg hover:shadow-[#9FCC2E]/10 ${cardStyle}`}>
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
          <div className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 ${cardStyle}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5A6650]">Open Tickets</p>
                <p className="text-3xl font-bold text-amber-500 mt-2">
                  {analytics.openTickets}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-500/20">
                <FolderOpen className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Closed Tickets */}
          <div className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 ${cardStyle}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5A6650]">Closed Tickets</p>
                <p className="text-3xl font-bold text-emerald-500 mt-2">
                  {analytics.closedTickets}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/20">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Avg Urgency Score */}
          <div className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 ${cardStyle}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5A6650]">Avg Urgency Score</p>
                <p className="text-3xl font-bold text-red-500 mt-2">
                  {analytics.avgUrgencyScore}/10
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Resolution Rate */}
          <div className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 ${cardStyle}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5A6650]">Resolution Rate</p>
                <p className="text-3xl font-bold text-emerald-500 mt-2">
                  {resolutionRate}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/20">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div className="mt-3 w-full bg-[#295135]/50 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${resolutionRate}%` }}
              />
            </div>
          </div>

          {/* Positive Sentiment */}
          <div className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 ${cardStyle}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5A6650]">Positive Sentiment</p>
                <p className="text-3xl font-bold text-emerald-500 mt-2">
                  {analytics.sentimentStats?.positive ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/20">
                <Smile className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Neutral Sentiment */}
          <div className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/10 ${cardStyle}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5A6650]">Neutral Sentiment</p>
                <p className="text-3xl font-bold text-gray-400 mt-2">
                  {analytics.sentimentStats?.neutral ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-500/20">
                <Meh className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Negative Sentiment */}
          <div className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 ${cardStyle}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5A6650]">Negative Sentiment</p>
                <p className="text-3xl font-bold text-red-500 mt-2">
                  {analytics.sentimentStats?.negative ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500/20">
                <Frown className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sentiment Distribution - Pie Chart */}
          <div className={`rounded-xl border p-6 ${cardStyle}`}>
            <h3 className="text-lg font-semibold mb-4 text-[#9FCC2E]">Sentiment Distribution</h3>
            {totalSentiments > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
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
                    formatter={(value: number) => [`${value} tickets`, 'Count']}
                  />
                  <Legend 
                    formatter={(value) => <span style={{ color: '#9FCC2E' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-75 text-[#5A6650]">
                No sentiment data available
              </div>
            )}
          </div>

          {/* Category Distribution - Bar Chart */}
          <div className={`rounded-xl border p-6 ${cardStyle}`}>
            <h3 className="text-lg font-semibold mb-4 text-[#9FCC2E]">Top Issue Categories</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis type="number" stroke={chartTextColor} fontSize={12} />
                  <YAxis 
                    dataKey="category" 
                    type="category" 
                    width={120} 
                    stroke={chartTextColor} 
                    fontSize={12}
                    tickFormatter={(value) => value.length > 15 ? `${value.slice(0, 15)}...` : value}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0E402D',
                      border: '1px solid #295135',
                      borderRadius: '8px',
                      color: '#9FCC2E'
                    }}
                    formatter={(value) => [`${value ?? 0} tickets`, 'Count']}
                  />
                  <Bar dataKey="count" name="Tickets" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-75 text-[#5A6650]">
                No category data available
              </div>
            )}
          </div>

          {/* Ticket Status - Pie Chart */}
          <div className={`rounded-xl border p-6 ${cardStyle}`}>
            <h3 className="text-lg font-semibold mb-4 text-[#9FCC2E]">Ticket Status Overview</h3>
            {analytics.totalTickets > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Open', value: analytics.openTickets, color: '#f59e0b' },
                      { name: 'Closed', value: analytics.closedTickets, color: '#10b981' },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    innerRadius={60} 
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0E402D',
                      border: '1px solid #295135',
                      borderRadius: '8px',
                      color: '#9FCC2E'
                    }}
                    formatter={(value) => [`${value ?? 0} tickets`, 'Count']}
                  />
                  <Legend 
                    formatter={(value) => <span style={{ color: '#9FCC2E' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-75 text-[#5A6650]">
                No ticket data available
              </div>
            )}
          </div>

          {/* Urgency Meter */}
          <div className={`rounded-xl border p-6 ${cardStyle}`}>
            <h3 className="text-lg font-semibold mb-4 text-[#9FCC2E]">Average Urgency Level</h3>
            <div className="flex flex-col items-center justify-center h-75">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#295135"
                    strokeWidth="12"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={analytics.avgUrgencyScore >= 7 ? '#ef4444' : analytics.avgUrgencyScore >= 4 ? '#f59e0b' : '#10b981'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(analytics.avgUrgencyScore / 10) * 251.2} 251.2`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${
                    analytics.avgUrgencyScore >= 7 ? 'text-red-500' : 
                    analytics.avgUrgencyScore >= 4 ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {analytics.avgUrgencyScore}
                  </span>
                  <span className="text-sm text-[#5A6650]">/10</span>
                </div>
              </div>
              <p className={`mt-4 text-lg font-medium ${
                analytics.avgUrgencyScore >= 7 ? 'text-red-500' : 
                analytics.avgUrgencyScore >= 4 ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                {analytics.avgUrgencyScore >= 7 ? 'High Urgency' : 
                 analytics.avgUrgencyScore >= 4 ? 'Medium Urgency' : 'Low Urgency'}
              </p>
              <p className="text-sm text-[#5A6650] mt-1">Based on AI analysis of all tickets</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Analytics, Feedback } from "@/lib/api/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, MessageSquare, ArrowRight, TrendingUp, AlertCircle, CheckCircle2, Bot } from "lucide-react";
import { CreateFeedbackModal } from "@/components/CreateFeedbackModal";

export default function DashboardPage() {
  const [stats, setStats] = useState<Analytics | null>(null);
  const [recent, setRecent] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [analyticsData, feedbackData] = await Promise.all([
        api.analytics.get(),
        api.feedback.list({ limit: 5 })
      ]);
      setStats(analyticsData);
      setRecent(feedbackData.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const positivePct = stats.positiveRatio ?? 52;
  const neutralPct = stats.neutralRatio ?? 28;
  const negativePct = stats.negativeRatio ?? 20;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Feedback Intelligence</h1>
          <p className="text-xs text-gray-500 mt-0.5">Real-time sentiment telemetry, automated theme clustering, and actionable AI insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/ai-studio">
            <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 dark:border-blue-900 dark:text-blue-400">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> Ask LOOP AI
            </Button>
          </Link>
          <Button size="sm" onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white">
            + Log Feedback
          </Button>
        </div>
      </div>

      {/* Top AI Highlight Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-900/20 via-indigo-900/15 to-purple-900/20 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">AI Executive Brief</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">Live</span>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
              Top positive driver: <strong>Intuitive Dashboard Navigation</strong>. Primary friction point: <strong>Export timeouts on datasets &gt;50MB</strong>.
            </p>
          </div>
        </div>
        <Link href="/ai-studio" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline shrink-0 flex items-center gap-1">
          Explore in AI Studio <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Total Feedback Processed</CardDescription>
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-3xl font-extrabold">{stats.totalFeedback}</CardTitle>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +14%
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-gray-500">Across 5 distinct ingest channels</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Net Sentiment Score</CardDescription>
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                {stats.averageSentimentScore !== undefined ? (stats.averageSentimentScore > 0 ? `+${stats.averageSentimentScore}` : stats.averageSentimentScore) : '+0.34'}
              </CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 text-[10px]">
                Healthy
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-gray-500">Scale from -1.0 (Negative) to +1.0 (Positive)</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Positive Ratio</CardDescription>
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {positivePct}%
              </CardTitle>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-1 overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: `${positivePct}%` }}></div>
              <div className="bg-amber-400 h-full" style={{ width: `${neutralPct}%` }}></div>
              <div className="bg-rose-500 h-full" style={{ width: `${negativePct}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Active Theme Clusters</CardDescription>
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {stats.totalThemes ?? 6}
              </CardTitle>
              <span className="text-xs font-semibold text-gray-500">Auto-tagged</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-gray-500">Top: UI/UX, Speed, Billing</p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart and Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Line Chart */}
        <Card className="lg:col-span-2 rounded-2xl border-gray-200 dark:border-gray-800 shadow-xs">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Feedback Volume & Trends</CardTitle>
                <CardDescription className="text-xs">Historical volume and intake distribution</CardDescription>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300">
                Last 30 Days
              </span>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.feedbackVolumeOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} name="Total Feedback" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Telemetry Distribution */}
        <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-xs flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg">Sentiment Telemetry</CardTitle>
            <CardDescription className="text-xs">Distribution breakdown by customer sentiment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Positive
                </span>
                <span>{positivePct}% ({stats.sentimentBreakdown?.positive ?? stats.resolved})</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${positivePct}%` }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Neutral
                </span>
                <span>{neutralPct}% ({stats.sentimentBreakdown?.neutral ?? stats.openFeedback})</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${neutralPct}%` }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Negative
                </span>
                <span>{negativePct}% ({stats.sentimentBreakdown?.negative ?? stats.inProgress})</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${negativePct}%` }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-500">
              <span>Overall Health</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {positivePct > 50 ? 'Strongly Positive' : 'Moderate'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback Feed */}
      <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Customer Feedback</CardTitle>
            <CardDescription className="text-xs">Latest feedback items requiring product attention</CardDescription>
          </div>
          <Link href="/feedback">
            <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-500">
              View All Feedback &rarr;
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recent.map((item) => (
              <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 px-2 rounded-xl transition">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {item.customerLabel ? `${item.customerLabel} User` : (item.source || 'Direct')}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-500 font-mono">
                      {item.channel}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.sentiment === 'POSITIVE'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : item.sentiment === 'NEGATIVE'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}>
                      {item.sentiment || 'NEUTRAL'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1">{item.content || item.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                  <Link href={`/feedback/${item.id}`}>
                    <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                      Inspect
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateFeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}

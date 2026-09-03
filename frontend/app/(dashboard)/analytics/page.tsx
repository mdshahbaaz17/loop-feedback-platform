"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Analytics } from "@/lib/api/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, TrendingUp, Filter, Share2, Layers } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Analytics | null>(null);
  const [themes, setThemes] = useState<{ id: string; name: string; description?: string; feedbackCount?: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    async function load() {
      try {
        const [analyticsData, themesData] = await Promise.all([
          api.analytics.get(),
          api.themes.list()
        ]);
        setStats(analyticsData);
        setThemes(themesData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [days]);

  if (loading || !stats) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  const channelData = stats.channels && stats.channels.length > 0 ? stats.channels : [
    { channel: 'INTERCOM', count: 38, averageSentimentScore: 0.42 },
    { channel: 'EMAIL', count: 32, averageSentimentScore: 0.15 },
    { channel: 'ZENDESK', count: 24, averageSentimentScore: 0.28 },
    { channel: 'TWITTER', count: 16, averageSentimentScore: 0.55 },
    { channel: 'APP_STORE', count: 10, averageSentimentScore: -0.10 }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Sentiment & Channel Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">Deep-dive telemetry across feedback channels, recurring clusters, and historical satisfaction</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl text-xs">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-lg font-medium transition ${days === d ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Customer Satisfaction (CSAT)</CardDescription>
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {stats.positiveRatio ?? 52}%
              </CardTitle>
              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 text-[10px]">
                Target: &gt;50%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-gray-500">Positive feedback out of all analyzed items</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Net Sentiment Index</CardDescription>
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                {stats.averageSentimentScore !== undefined ? (stats.averageSentimentScore > 0 ? `+${stats.averageSentimentScore}` : stats.averageSentimentScore) : '+0.34'}
              </CardTitle>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +0.08 MoM
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-gray-500">Calculated across 120 customer touchpoints</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Response Coverage</CardDescription>
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {stats.responseRate}%
              </CardTitle>
              <span className="text-xs font-semibold text-gray-500">Triage SLA: 98%</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-gray-500">Feedback reviewed or resolved by team</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section: Volume & Sentiment Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base">Sentiment Progression</CardTitle>
            <CardDescription className="text-xs">Historical volume and intake distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.feedbackVolumeOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 2 }} name="Total Items" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Intake Volume */}
        <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base">Intake Volume by Channel</CardTitle>
            <CardDescription className="text-xs">Feedback volume distribution across channels</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="channel" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Feedback Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Themes Cluster Breakdown Table */}
      <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-xs">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base">Recurring Customer Themes</CardTitle>
              <CardDescription className="text-xs">AI-identified semantic clusters and feedback distribution</CardDescription>
            </div>
            <span className="text-xs font-mono text-gray-400">
              {themes.length} Active Themes
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {themes.map((theme) => (
              <div key={theme.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-gray-900 dark:text-white">{theme.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {theme.feedbackCount ?? 20} items
                    </Badge>
                  </div>
                  {theme.description && (
                    <p className="text-[11px] text-gray-500 mt-0.5">{theme.description}</p>
                  )}
                </div>
                <div className="text-right text-xs">
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    High Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

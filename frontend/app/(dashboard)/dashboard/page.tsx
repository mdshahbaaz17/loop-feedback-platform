"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Analytics, Feedback } from "@/lib/api/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<Analytics | null>(null);
  const [recent, setRecent] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [analyticsData, feedbackData] = await Promise.all([
        api.analytics.get(),
        api.feedback.list()
      ]);
      setStats(analyticsData);
      setRecent(feedbackData.slice(0, 3));
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Feedback</CardDescription>
            <CardTitle className="text-3xl">{stats.totalFeedback}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open Items</CardDescription>
            <CardTitle className="text-3xl text-yellow-600 dark:text-yellow-500">{stats.openFeedback}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-3xl text-green-600 dark:text-green-500">{stats.resolved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Loops</CardDescription>
            <CardTitle className="text-3xl text-blue-600 dark:text-blue-500">{stats.activeLoops}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Feedback Volume</CardTitle>
            <CardDescription>Feedback submitted over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.feedbackVolumeOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>Latest items needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent.map(item => (
                <div key={item.id} className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold truncate pr-2">{item.title}</h4>
                    <Badge variant={item.status === 'NEW' ? 'default' : item.status === 'IN_PROGRESS' ? 'warning' : 'success'}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

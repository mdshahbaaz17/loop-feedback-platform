"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Feedback } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { CreateFeedbackModal } from "@/components/CreateFeedbackModal";

export default function FeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.feedback.list({
        search: search.trim() || undefined,
        sentiment: sentimentFilter,
        status: statusFilter,
        channel: channelFilter,
      });
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, sentimentFilter, statusFilter, channelFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFeedback();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchFeedback]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Feedback Registry</h1>
          <p className="text-xs text-gray-500 mt-0.5">Categorized customer issues, suggestions, and telemetry across all touchpoints</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchFeedback()}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white">
            <Plus className="w-4 h-4 mr-1" /> Log Feedback
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedback by keywords, customer, or source..."
            className="pl-9 text-xs h-9 bg-white dark:bg-zinc-950 border-gray-200 dark:border-gray-800"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="p-2 text-xs border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-zinc-950 text-gray-700 dark:text-gray-300"
          >
            <option value="ALL">All Sentiments</option>
            <option value="POSITIVE">Positive 😊</option>
            <option value="NEUTRAL">Neutral 😐</option>
            <option value="NEGATIVE">Negative 😡</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 text-xs border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-zinc-950 text-gray-700 dark:text-gray-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="p-2 text-xs border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-zinc-950 text-gray-700 dark:text-gray-300"
          >
            <option value="ALL">All Channels</option>
            <option value="INTERCOM">Intercom</option>
            <option value="EMAIL">Email</option>
            <option value="ZENDESK">Zendesk</option>
            <option value="TWITTER">Twitter</option>
            <option value="APP_STORE">App Store</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-950 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
          <p className="text-sm font-medium text-gray-500">No feedback matches your active filters.</p>
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setSentimentFilter("ALL"); setStatusFilter("ALL"); setChannelFilter("ALL"); }} className="mt-2 text-blue-600">
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Feedback Item</th>
                <th className="px-4 py-3.5">Channel</th>
                <th className="px-4 py-3.5">Sentiment</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-5 py-3.5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/70 dark:hover:bg-zinc-900/40 transition">
                  <td className="px-5 py-3.5 max-w-md">
                    <Link href={`/feedback/${item.id}`} className="hover:text-blue-600 block">
                      <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {item.title || item.content}
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{item.content}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">
                      {item.channel || 'EMAIL'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.sentiment === 'POSITIVE'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : item.sentiment === 'NEGATIVE'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}>
                      {item.sentiment || 'NEUTRAL'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={item.status === 'NEW' ? 'default' : item.status === 'REVIEWED' ? 'warning' : 'success'} className="text-[10px]">
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-[11px]">
                    {item.customerLabel || item.source || 'General'}
                  </td>
                  <td className="px-5 py-3.5 text-right text-gray-400 text-[11px]">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateFeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchFeedback}
      />
    </div>
  );
}

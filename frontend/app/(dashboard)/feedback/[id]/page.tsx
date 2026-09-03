"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { Feedback } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Clock, User, Tag, Sparkles, CheckCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function FeedbackDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [item, setItem] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [reclassifying, setReclassifying] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{ id: string; author: string; text: string; time: string }[]>([
    { id: 'c1', author: 'AI Triage Agent', text: 'Sentiment scored and automatically tagged to workspace themes.', time: 'System Event' }
  ]);

  const loadItem = async () => {
    try {
      const data = await api.feedback.get(resolvedParams.id);
      if (data) setItem(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [resolvedParams.id]);

  const handleStatusChange = async (newStatus: 'NEW' | 'REVIEWED' | 'RESOLVED') => {
    if (!item) return;
    setUpdating(true);
    try {
      const updated = await api.feedback.update(item.id, { status: newStatus });
      setItem(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleReclassify = async () => {
    if (!item) return;
    setReclassifying(true);
    try {
      await api.feedback.reclassify(item.id);
      await loadItem();
    } catch (e) {
      console.error(e);
    } finally {
      setReclassifying(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments(prev => [
      ...prev,
      {
        id: 'c-' + Date.now(),
        author: 'Current User',
        text: commentText.trim(),
        time: 'Just now'
      }
    ]);
    setCommentText("");
  };

  if (loading || !item) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link href="/feedback" className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-300">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Feedback
        </Link>
        <span className="text-[11px] font-mono text-gray-400">ID: {item.id}</span>
      </div>

      {/* Main Feedback Card */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-semibold">
                {item.channel || 'EMAIL'}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                item.sentiment === 'POSITIVE'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : item.sentiment === 'NEGATIVE'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
              }`}>
                {item.sentiment || 'NEUTRAL'} ({item.sentimentScore !== undefined ? `${(item.sentimentScore > 0 ? '+' : '')}${item.sentimentScore}` : '0.0'})
              </span>
            </div>

            {/* Quick Status Action Buttons */}
            <div className="flex items-center gap-1.5">
              {(['NEW', 'REVIEWED', 'RESOLVED'] as const).map((status) => (
                <button
                  key={status}
                  disabled={updating}
                  onClick={() => handleStatusChange(status)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition ${
                    item.status === status
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {item.title || item.content}
          </h1>

          <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-zinc-900/40 border border-gray-100 dark:border-gray-800">
            <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {item.content || item.description}
            </p>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-500 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Customer Segment: <strong className="text-gray-700 dark:text-gray-300">{item.customerLabel || 'SMB'}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Source: <strong className="text-gray-700 dark:text-gray-300">{item.source || 'Direct'}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Logged: <span>{new Date(item.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Theme Badges */}
          {item.themes && item.themes.length > 0 && (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] font-semibold text-gray-400">Attached Themes:</span>
              {item.themes.map((t, idx) => (
                <span key={idx} className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full text-xs font-medium">
                  🏷️ {t.theme?.name}
                </span>
              ))}
            </div>
          )}

          {/* AI Reclassify Button */}
          <div className="pt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={reclassifying}
              onClick={handleReclassify}
              className="text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              {reclassifying ? "Analyzing with AI..." : "Reclassify with AI Engine"}
            </Button>
          </div>
        </div>

        {/* Activity & Comments */}
        <div className="p-6 bg-gray-50/50 dark:bg-zinc-900/30">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" /> Internal Notes & Audit Trail
          </h3>

          <div className="space-y-3 mb-6">
            {comments.map((c) => (
              <div key={c.id} className="p-3.5 bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-gray-800 text-xs space-y-1">
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{c.author}</span>
                  <span>{c.time}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{c.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="space-y-2">
            <textarea
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add an internal note or next action item..."
              className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 dark:text-white"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" className="text-xs bg-blue-600 hover:bg-blue-500 text-white">
                Add Note
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

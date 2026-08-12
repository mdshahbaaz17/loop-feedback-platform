// frontend/app/dashboard/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FeedbackItem {
  id: string
  customer: string
  company: string
  message: string
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  score: number
  category: string
  date: string
  urgency: 'HIGH' | 'MEDIUM' | 'LOW'
}

const MOCK_FEEDBACK: FeedbackItem[] = [
  {
    id: 'FB-101',
    customer: 'Sarah Jenkins',
    company: 'CloudTech Systems',
    message: 'The new API endpoints are significantly faster! Response times dropped by 40% after the latest update.',
    sentiment: 'POSITIVE',
    score: 0.92,
    category: 'API Performance',
    date: '2026-08-12',
    urgency: 'LOW',
  },
  {
    id: 'FB-102',
    customer: 'David Chen',
    company: 'Nexus Analytics',
    message: 'Encountered export timeouts when trying to extract reports larger than 50MB. Needs urgent optimization.',
    sentiment: 'NEGATIVE',
    score: 0.18,
    category: 'Reporting & Export',
    date: '2026-08-11',
    urgency: 'HIGH',
  },
  {
    id: 'FB-103',
    customer: 'Elena Rostova',
    company: 'FinPulse Software',
    message: 'The dark UI theme looks clean, but dark mode contrast on grid lines could be slightly higher.',
    sentiment: 'NEUTRAL',
    score: 0.55,
    category: 'UI / UX',
    date: '2026-08-10',
    urgency: 'MEDIUM',
  },
]

export default function DashboardInboxPage() {
  const [search, setSearch] = useState('')
  const [filterSentiment, setFilterSentiment] = useState('ALL')
  const [selectedReply, setSelectedReply] = useState<FeedbackItem | null>(null)
  const [aiDraft, setAiDraft] = useState('')

  const handleOpenAiReply = (item: FeedbackItem) => {
    setSelectedReply(item)
    setAiDraft(
      `Hi ${item.customer},\n\nThank you for sharing your feedback regarding ${item.category}. Our team has reviewed your note ("${item.message.slice(0, 40)}...") and logged it with our product team.\n\nBest regards,\nLOOP Support`
    )
  }

  const filteredItems = MOCK_FEEDBACK.filter((item) => {
    const matchesSearch =
      item.customer.toLowerCase().includes(search.toLowerCase()) ||
      item.message.toLowerCase().includes(search.toLowerCase()) ||
      item.company.toLowerCase().includes(search.toLowerCase())
    const matchesSentiment =
      filterSentiment === 'ALL' || item.sentiment === filterSentiment
    return matchesSearch && matchesSentiment
  })

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Feedback Inbox</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time customer reviews, sentiment scoring, and AI workflow triggers
          </p>
        </div>
        <Link
          href="/dashboard/feedback/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-indigo-600/20 w-fit"
        >
          <span>+</span> Log New Feedback
        </Link>
      </div>

      {/* AI Executive Anomaly Detection Card */}
      <div className="p-4 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 text-sm mt-0.5">
            🤖
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-200">AI Cluster Insight</p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Detected <strong>18% spike in export timeouts</strong> across FinTech accounts over the last 48 hours.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/ai-studio"
          className="text-xs font-medium text-indigo-300 hover:text-white bg-indigo-600/30 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition shrink-0"
        >
          Open AI Studio →
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search customer, company, or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-900/90 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition"
        />
        <select
          value={filterSentiment}
          onChange={(e) => setFilterSentiment(e.target.value)}
          className="bg-slate-900/90 border border-slate-800 text-slate-300 text-xs rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
        >
          <option value="ALL">All Sentiments</option>
          <option value="POSITIVE">Positive Only</option>
          <option value="NEGATIVE">Negative Only</option>
          <option value="NEUTRAL">Neutral Only</option>
        </select>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition shadow-sm backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-slate-200">{item.customer}</span>
                <span className="text-[10px] text-slate-500">• {item.company}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    item.sentiment === 'POSITIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : item.sentiment === 'NEGATIVE'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {item.sentiment} ({Math.round(item.score * 100)}%)
                </span>
                
                <button
                  onClick={() => handleOpenAiReply(item)}
                  className="text-[10px] font-medium px-2.5 py-1 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-lg border border-indigo-500/30 transition"
                >
                  ✨ AI Reply
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
              <span>Category: <strong className="text-slate-400">{item.category}</strong></span>
              <span>{item.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Reply Modal */}
      {selectedReply && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <span>✨ AI Draft Response for {selectedReply.customer}</span>
              </h3>
              <button
                onClick={() => setSelectedReply(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={6}
              value={aiDraft}
              onChange={(e) => setAiDraft(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert('AI response sent successfully!')
                  setSelectedReply(null)
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition"
              >
                Send Response →
              </button>
              <button
                onClick={() => setSelectedReply(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
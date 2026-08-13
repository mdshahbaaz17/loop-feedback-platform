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
  },
  {
    id: 'FB-102',
    customer: 'David Chen',
    company: 'Nexus Analytics',
    message: 'Encountered export timeouts when trying to extract reports larger than 50MB. Needs optimization.',
    sentiment: 'NEGATIVE',
    score: 0.18,
    category: 'Reporting & Export',
    date: '2026-08-11',
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
  },
]

export default function DashboardInboxPage() {
  const [search, setSearch] = useState('')
  const [filterSentiment, setFilterSentiment] = useState('ALL')

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Feedback Inbox</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time customer reviews and AI sentiment classification
          </p>
        </div>
        <Link
          href="/dashboard/feedback/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition shadow-md w-fit"
        >
          <span>+</span> Log New Feedback
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search customer, company, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg p-3 focus:outline-none focus:border-indigo-500 transition"
        />
        <select
          value={filterSentiment}
          onChange={(e) => setFilterSentiment(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg p-3 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
        >
          <option value="ALL">All Sentiments</option>
          <option value="POSITIVE">Positive Only</option>
          <option value="NEGATIVE">Negative Only</option>
          <option value="NEUTRAL">Neutral Only</option>
        </select>
      </div>

      {/* Feedback Feed */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-slate-900/80 border border-slate-800/90 rounded-xl space-y-3 hover:border-slate-700 transition shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-slate-200">{item.customer}</span>
                <span className="text-[10px] text-slate-500">• {item.company}</span>
              </div>
              
              {/* Sentiment Badge */}
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
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.message}</p>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/50">
              <span>Category: <strong className="text-slate-400">{item.category}</strong></span>
              <span>{item.date}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
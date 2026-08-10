'use client'

import { useState } from 'react'
import Link from 'next/link'

const initialFeedback = [
  {
    id: 'FB-1042',
    customer: 'Sarah Jenkins',
    email: 'sarah.j@acme.com',
    source: 'Support Ticket',
    content: 'The new dashboard loading speed improved significantly, but the export CSV button intermittently fails on Safari.',
    sentiment: 'POS',
    status: 'NEW',
    date: '12 mins ago'
  },
  {
    id: 'FB-1041',
    customer: 'David Chen',
    email: 'd.chen@enterprise.io',
    source: 'Sales Call',
    content: 'Payment processing keeps failing with Error Code 500 during checkout. We lost 3 customer orders today because of this.',
    sentiment: 'NEG',
    status: 'IN_PROGRESS',
    date: '1 hour ago'
  },
  {
    id: 'FB-1040',
    customer: 'Marcus Vance',
    email: 'marcus@buildtech.dev',
    source: 'App Store Review',
    content: 'Overall solid platform. Would be great if we could customize the dark mode color scheme or integrate with Slack.',
    sentiment: 'NEU',
    status: 'RESOLVED',
    date: '3 hours ago'
  },
  {
    id: 'FB-1039',
    customer: 'Elena Rostova',
    email: 'elena@designstudio.co',
    source: 'NPS Survey',
    content: 'The automated sentiment tagging feature saved our customer success team over 10 hours this week. Phenomenal work!',
    sentiment: 'POS',
    status: 'RESOLVED',
    date: 'Yesterday'
  }
]

export default function DashboardInboxPage() {
  const [filter, setFilter] = useState<'ALL' | 'POS' | 'NEG' | 'NEU'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFeedback = initialFeedback.filter(item => {
    const matchesSentiment = filter === 'ALL' || item.sentiment === filter
    const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSentiment && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Feedback Inbox</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time customer feedback feed with automated sentiment classification
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/feedback/new"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-xs rounded-lg transition shadow-sm flex items-center gap-1.5"
          >
            <span>+</span> Log Feedback
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl">
          <span className="text-xs font-medium text-slate-400">Total Logged</span>
          <p className="text-2xl font-bold text-slate-100 mt-1">1,248</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl">
          <span className="text-xs font-medium text-slate-400">Positive Sentiment</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">68%</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl">
          <span className="text-xs font-medium text-slate-400">Requires Attention</span>
          <p className="text-2xl font-bold text-rose-400 mt-1">14</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl">
          <span className="text-xs font-medium text-slate-400">Avg Resolution Time</span>
          <p className="text-2xl font-bold text-slate-100 mt-1">4.2 hrs</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 bg-slate-900 p-1 border border-slate-800 rounded-lg text-xs font-medium w-fit">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-md transition ${
              filter === 'ALL' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Feedback
          </button>
          <button
            onClick={() => setFilter('POS')}
            className={`px-3 py-1.5 rounded-md transition ${
              filter === 'POS' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Positive
          </button>
          <button
            onClick={() => setFilter('NEG')}
            className={`px-3 py-1.5 rounded-md transition ${
              filter === 'NEG' ? 'bg-slate-800 text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Negative
          </button>
          <button
            onClick={() => setFilter('NEU')}
            className={`px-3 py-1.5 rounded-md transition ${
              filter === 'NEU' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Neutral
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feedback or customer..."
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3.5 py-2 focus:outline-none focus:border-indigo-500/80 transition placeholder:text-slate-500"
          />
          <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono border border-slate-800 rounded px-1.5 py-0.5">
            ⌘K
          </span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-800/80">
          {filteredFeedback.length > 0 ? (
            filteredFeedback.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 hover:bg-slate-800/40 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-slate-400 font-semibold">{item.id}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300 font-medium">{item.customer}</span>
                    <span className="text-slate-500 hidden sm:inline">({item.email})</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px] hidden sm:inline">{item.date}</span>
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md border ${
                      item.sentiment === 'POS'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : item.sentiment === 'NEG'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {item.sentiment === 'POS' ? 'Positive' : item.sentiment === 'NEG' ? 'Negative' : 'Neutral'}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  "{item.content}"
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700/60 font-medium">
                      {item.source}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-slate-200 transition font-medium">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              No customer feedback matches your search or active filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
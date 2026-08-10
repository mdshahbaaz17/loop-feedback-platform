// frontend/app/dashboard/feedback/new/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewFeedbackPage() {
  const router = useRouter()
  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [source, setSource] = useState('Support Ticket')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API network call delay
    setTimeout(() => {
      setIsSubmitting(false)
      router.push('/dashboard')
    }, 800)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Page Heading */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <Link href="/dashboard" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
            ← Back to Inbox
          </Link>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-1">Log Customer Feedback</h1>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Customer Name *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Customer Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Source Channel */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Channel Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="Support Ticket">Support Ticket</option>
            <option value="Sales Call">Sales Call</option>
            <option value="NPS Survey">NPS Survey</option>
            <option value="App Store Review">App Store Review</option>
            <option value="Direct Email">Direct Email</option>
          </select>
        </div>

        {/* Feedback Content */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-slate-300">Feedback Content *</label>
            <span className="text-[10px] text-slate-500">{content.length} / 500 chars</span>
          </div>
          <textarea
            required
            rows={4}
            maxLength={500}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste verbatim customer commentary or transcript notes here..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-3 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600 leading-relaxed"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800/80">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Analyzing & Saving...' : 'Submit Feedback'}
          </button>
        </div>

      </form>
    </div>
  )
}
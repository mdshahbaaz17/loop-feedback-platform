// frontend/app/dashboard/analytics/page.tsx
'use client'

export default function AnalyticsPage() {
  const metrics = [
    { title: 'Total Submissions', value: '1,284', change: '+12% this month' },
    { title: 'Avg. Sentiment Score', value: '78%', change: '+4% improvement' },
    { title: 'Positive Feedback', value: '64%', change: '822 responses' },
    { title: 'Critical Risk Items', value: '14%', change: '180 requiring action' },
  ]

  const categories = [
    { name: 'API & Performance', positive: 85, neutral: 10, negative: 5 },
    { name: 'UI / UX Design', positive: 60, neutral: 25, negative: 15 },
    { name: 'Billing & Subscriptions', positive: 45, neutral: 30, negative: 25 },
    { name: 'Feature Requests', positive: 70, neutral: 20, negative: 10 },
  ]

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold text-slate-100">Executive Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">
          Aggregated sentiment metrics, trend distribution, and risk alerts
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.title} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">{m.title}</p>
            <p className="text-2xl font-bold text-slate-100">{m.value}</p>
            <p className="text-[10px] text-emerald-400">{m.change}</p>
          </div>
        ))}
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-200">Category Sentiment Distribution</h2>
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{cat.name}</span>
                <span className="text-[11px] text-slate-400">
                  {cat.positive}% Pos / {cat.neutral}% Neu / {cat.negative}% Neg
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
                <div style={{ width: `${cat.positive}%` }} className="bg-emerald-500 h-full" />
                <div style={{ width: `${cat.neutral}%` }} className="bg-amber-500 h-full" />
                <div style={{ width: `${cat.negative}%` }} className="bg-rose-500 h-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
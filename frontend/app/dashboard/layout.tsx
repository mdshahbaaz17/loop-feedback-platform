// frontend/app/dashboard/layout.tsx
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col justify-between p-4">
        <div className="space-y-6">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2 pt-1">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xs tracking-wider shadow-sm">
              LP
            </div>
            <div>
              <span className="font-bold text-slate-100 text-sm tracking-tight block">LOOP</span>
              <span className="text-[10px] text-slate-500 block -mt-0.5">Enterprise v1.2</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 text-xs font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-3 py-2 bg-indigo-600/10 text-indigo-400 rounded-lg border border-indigo-500/20 transition font-semibold"
            >
              <span>📥</span> Feedback Inbox
            </Link>
            <Link
              href="/dashboard/analytics"
              className="flex items-center gap-2.5 px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
            >
              <span>📊</span> Sentiment Analytics
            </Link>
          </nav>
        </div>

        {/* User Account & Sign Out */}
        <div className="pt-4 border-t border-slate-800/80 mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
              AP
            </div>
            <div className="text-xs">
              <p className="font-medium text-slate-200 leading-none">Admin Profile</p>
              <p className="text-[10px] text-slate-500 mt-0.5">admin@acme.com</p>
            </div>
          </div>
          <Link
            href="/login"
            className="text-[10px] text-slate-500 hover:text-rose-400 transition font-medium"
          >
            Sign Out
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-8 max-w-6xl overflow-y-auto">
        {children}
      </main>

    </div>
  )
}
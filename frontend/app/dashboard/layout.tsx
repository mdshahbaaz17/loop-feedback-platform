// frontend/app/dashboard/layout.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { label: '📥 Feedback Inbox', href: '/dashboard' },
    { label: '⚡ AI Studio & Playground', href: '/dashboard/ai-studio', badge: 'NEW' },
    { label: '📊 Analytics', href: '/dashboard/analytics' },
    { label: '➕ Log Feedback', href: '/dashboard/feedback/new' },
    { label: '👥 Team & RBAC', href: '/dashboard/team' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0 shadow-2xl relative z-20">
        <div className="space-y-6">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                LP
              </div>
              <div>
                <span className="font-bold text-slate-100 tracking-tight text-sm block">LOOP Engine</span>
                <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  AI v2.4 Active
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/20 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* AI Health Footer Card */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">AI Tokens Used</span>
              <span className="text-indigo-400 font-mono font-semibold">68.4k</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[68%]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-slate-300 font-medium text-[11px]">Admin Workspace</span>
            </div>
            <Link href="/login" className="text-rose-400 hover:text-rose-300 text-[11px] font-medium transition">
              Exit
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
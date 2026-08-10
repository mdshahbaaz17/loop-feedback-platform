// frontend/app/layout.tsx
import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'LOOP | Customer Feedback Intelligence Platform',
  description: 'Enterprise feedback tracking and sentiment classification platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans min-h-screen flex flex-col md:flex-row">
        
        {/* --- SIDEBAR NAVIGATION --- */}
        <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col justify-between p-4">
          <div className="space-y-6">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5 px-2 pt-1">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xs tracking-wider shadow-sm">
                LP
              </div>
              <div>
                <span className="font-bold text-slate-100 text-sm tracking-tight block">LOOP</span>
                <span className="text-[10px] text-slate-500 block -mt-0.5">Enterprise v1.2</span>
              </div>
            </div>

            {/* Navigation Links */}
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
              <Link
                href="/dashboard/team"
                className="flex items-center gap-2.5 px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
              >
                <span>👥</span> Team Access (RBAC)
              </Link>

              <div className="pt-4 pb-1 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Integrations
              </div>
              <a href="#" className="flex items-center justify-between px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition">
                <span className="flex items-center gap-2"><span>💬</span> Slack Bot</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono">Active</span>
              </a>
              <a href="#" className="flex items-center justify-between px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition">
                <span className="flex items-center gap-2"><span>🎫</span> Zendesk Sync</span>
                <span className="text-[9px] bg-slate-800 text-slate-500 border border-slate-700 px-1.5 py-0.2 rounded font-mono">Idle</span>
              </a>
            </nav>

          </div>

          {/* User Account / Footer Status */}
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
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl overflow-y-auto">
          {children}
        </main>

      </body>
    </html>
  )
}
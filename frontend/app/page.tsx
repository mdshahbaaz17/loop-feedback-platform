// frontend/app/page.tsx
import Link from 'next/link'

export default function RootPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center font-bold text-white text-lg tracking-wider shadow-lg">
          LP
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Project LOOP</h1>
          <p className="text-xs text-slate-400 mt-1">
            Customer Feedback & AI Sentiment Intelligence Platform
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="w-full inline-block px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-lg"
          >
            Go to Login Screen →
          </Link>
        </div>
      </div>
    </div>
  )
}
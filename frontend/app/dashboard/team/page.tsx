// frontend/app/dashboard/team/page.tsx
'use client'

export default function TeamManagementPage() {
  const members = [
    { name: 'Alex Rivera', email: 'alex@loop.io', role: 'Owner', status: 'Active' },
    { name: 'Sarah Chen', email: 'sarah@loop.io', role: 'Admin', status: 'Active' },
    { name: 'Marcus Vance', email: 'marcus@loop.io', role: 'Viewer', status: 'Invited' },
  ]

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold text-slate-100">Team & Access Control (RBAC)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage workspace members and permission roles
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
            <tr>
              <th className="p-4">Member</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {members.map((m) => (
              <tr key={m.email} className="hover:bg-slate-800/30 transition">
                <td className="p-4">
                  <div className="font-semibold text-slate-200">{m.name}</div>
                  <div className="text-[10px] text-slate-500">{m.email}</div>
                </td>
                <td className="p-4 font-mono text-indigo-400">{m.role}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
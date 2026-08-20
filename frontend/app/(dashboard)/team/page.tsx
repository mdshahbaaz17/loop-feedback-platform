"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { User } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api.team.list().then(setUsers);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h1>
        <Button>Invite Member</Button>
      </div>
      
      <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-500">Name</th>
              <th className="px-6 py-4 font-medium text-gray-500">Role</th>
              <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Image src={user.avatar || "https://i.pravatar.cc/150"} alt="" width={32} height={32} className="rounded-full bg-gray-200" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="secondary">{user.role}</Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

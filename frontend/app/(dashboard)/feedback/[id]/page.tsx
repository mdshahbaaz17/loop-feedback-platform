"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { Feedback } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Clock, User, Tag } from "lucide-react";
import Link from "next/link";

export default function FeedbackDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [item, setItem] = useState<Feedback | null>(null);

  useEffect(() => {
    api.feedback.get(resolvedParams.id).then(data => {
      if (data) setItem(data);
    });
  }, [resolvedParams.id]);

  if (!item) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/feedback" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Feedback
      </Link>

      <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{item.title}</h1>
            <div className="flex gap-2">
              <Badge variant={item.status === 'NEW' ? 'default' : item.status === 'IN_PROGRESS' ? 'warning' : 'success'}>
                {item.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">{item.priority} PRIORITY</Badge>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
            {item.description}
          </p>

          <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-1"><User className="w-4 h-4" /> Reported by {item.authorId}</div>
            <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(item.createdAt).toLocaleString()}</div>
            <div className="flex items-center gap-1"><Tag className="w-4 h-4" /> {item.category}</div>
          </div>
          
          {item.tags.length > 0 && (
            <div className="flex gap-2 mt-4">
              {item.tags.map(tag => (
                <span key={tag} className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 dark:bg-zinc-900/50 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Discussion & Activity
          </h3>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-700 before:to-transparent">
            {/* Timeline Item */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-black bg-gray-100 dark:bg-gray-800 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <Clock className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">Feedback created</span>
                  <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <textarea className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Add a comment..."></textarea>
            <div className="flex justify-end mt-2">
              <Button>Post Comment</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

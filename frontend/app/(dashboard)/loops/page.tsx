"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { FeedbackLoop } from "@/lib/api/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function LoopsPage() {
  const [loops, setLoops] = useState<FeedbackLoop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.loops.list().then(data => {
      setLoops(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback Loops</h1>
        <Button><Plus className="w-4 h-4 mr-2" /> Create Loop</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loops.map(loop => (
            <Card key={loop.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={loop.status === 'ACTIVE' ? 'success' : 'secondary'}>{loop.status}</Badge>
                  <span className="text-xs text-gray-500">{new Date(loop.updatedAt).toLocaleDateString()}</span>
                </div>
                <CardTitle className="text-lg">{loop.name}</CardTitle>
                <CardDescription className="line-clamp-2">{loop.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between text-sm">
                  <span className="text-gray-500">{loop.feedbackIds.length} items</span>
                  <span className="text-blue-600 hover:underline">View Details &rarr;</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

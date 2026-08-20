import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateFeedbackModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Create Feedback</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input required placeholder="E.g. App crashes on login" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea required className="w-full h-24 p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-blue-600" placeholder="Provide more details..."></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-transparent">
                <option>Bug</option>
                <option>Feature Request</option>
                <option>UI/UX</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-transparent">
                <option>LOW</option>
                <option>MEDIUM</option>
                <option>HIGH</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Feedback"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

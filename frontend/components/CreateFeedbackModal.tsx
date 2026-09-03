import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export function CreateFeedbackModal({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [source, setSource] = useState("Direct");
  const [channel, setChannel] = useState("INTERCOM");
  const [customerLabel, setCustomerLabel] = useState("SMB");
  const [sentiment, setSentiment] = useState("NEUTRAL");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    try {
      await api.feedback.create({
        content: content.trim(),
        source: source || 'Web App',
        channel,
        customerLabel,
        sentiment: sentiment as any,
      });
      setContent("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to create feedback:", err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in-50 zoom-in-95">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Log Customer Feedback</h2>
            <p className="text-xs text-gray-500">Add feedback with automatic sentiment & theme tagging</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
              Feedback Content *
            </label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 dark:text-white"
              placeholder="e.g. Customers report that report export times out on files >50MB..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full p-2.5 text-xs border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white"
              >
                <option value="INTERCOM">Intercom</option>
                <option value="EMAIL">Email</option>
                <option value="ZENDESK">Zendesk</option>
                <option value="TWITTER">Twitter</option>
                <option value="APP_STORE">App Store</option>
                <option value="DIRECT">Direct Call</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                Customer Segment
              </label>
              <select
                value={customerLabel}
                onChange={(e) => setCustomerLabel(e.target.value)}
                className="w-full p-2.5 text-xs border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white"
              >
                <option value="Enterprise">Enterprise</option>
                <option value="SMB">SMB</option>
                <option value="VIP">VIP Account</option>
                <option value="Free Tier">Free Tier</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                Source Tag
              </label>
              <Input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Sales Call / QBR"
                className="text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                Initial Sentiment
              </label>
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value)}
                className="w-full p-2.5 text-xs border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white"
              >
                <option value="POSITIVE">Positive 😊</option>
                <option value="NEUTRAL">Neutral 😐</option>
                <option value="NEGATIVE">Negative 😡</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500 text-white" disabled={loading}>
              {loading ? "Analyzing & Saving..." : "Save & Analyze Feedback"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

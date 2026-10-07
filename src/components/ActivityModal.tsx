import { useState } from "react";
import { X } from "lucide-react";
import { createActivity } from "@/lib/api";

interface Props {
  dealId?: string;
  contactId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ActivityModal({ dealId, contactId, onClose, onSuccess }: Props) {
  const [type, setType] = useState("note");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createActivity({
        type,
        title,
        description: description || null,
        deal_id: dealId ?? null,
        contact_id: contactId ?? null,
      });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create activity");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-card-border rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">New Activity</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="note">Note</option>
              <option value="meeting">Meeting</option>
              <option value="call">Call</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. Follow-up call with prospect"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Details..."
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? "Saving..." : "Add Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

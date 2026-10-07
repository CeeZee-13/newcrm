import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createDeal } from "@/lib/api";
import { useCompanies, useContacts } from "@/lib/api";
import { STAGES } from "@/lib/utils";

interface Props {
  defaultStage?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewDealModal({ defaultStage = "lead", onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState(defaultStage);
  const [capex, setCapex] = useState("");
  const [opex, setOpex] = useState("");
  const [probability, setProbability] = useState("");
  const [description, setDescription] = useState("");
  const [contactId, setContactId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { list: listContacts } = useContacts();
  const { list: listCompanies } = useCompanies();
  const [contacts, setContacts] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    listContacts().then((d) => setContacts(d)).catch(() => {});
    listCompanies().then((d) => setCompanies(d)).catch(() => {});
  }, []); // eslint-disable-line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createDeal({
        title,
        stage,
        capex: capex ? parseFloat(capex) : null,
        opex: opex ? parseFloat(opex) : null,
        probability: probability ? parseInt(probability) : null,
        description: description || null,
        contact_id: contactId || null,
        company_id: companyId || null,
      });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create deal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-card-border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">New Deal</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Deal Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. Acme Corp Platform Deal"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Probability (%)</label>
              <input
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                type="number"
                min="0"
                max="100"
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Capex</label>
              <input
                value={capex}
                onChange={(e) => setCapex(e.target.value)}
                type="number"
                step="0.01"
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Opex</label>
              <input
                value={opex}
                onChange={(e) => setOpex(e.target.value)}
                type="number"
                step="0.01"
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Contact</label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">No contact</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Company</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">No company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Optional description..."
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
              {saving ? "Creating..." : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

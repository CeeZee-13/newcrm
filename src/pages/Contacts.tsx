import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useContacts, useCompanies, createContact } from "@/lib/api";
import { Plus, Search, X, Building2, Mail, Phone } from "lucide-react";

function NewContactModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { list: listCompanies } = useCompanies();
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    listCompanies().then(setCompanies).catch(() => {});
  }, []); // eslint-disable-line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createContact({
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        phone: phone || null,
        job_title: jobTitle || null,
        company_id: companyId || null,
        notes: notes || null,
      });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create contact");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-card-border rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">New Contact</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">First Name *</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Last Name *</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Job Title</label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Company</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">No company</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
              {saving ? "Saving..." : "Save Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [contacts, setContacts] = useState<Awaited<ReturnType<typeof useContacts>["list"]>>([]);
  const [loading, setLoading] = useState(true);
  const { list: listContacts } = useContacts();

  const reload = useCallback(() => {
    setLoading(true);
    listContacts(search || undefined)
      .then(setContacts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listContacts, search]);

  useEffect(() => {
    const t = setTimeout(reload, 200);
    return () => clearTimeout(t);
  }, [reload]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Contact
        </button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="w-full border border-input rounded-md pl-9 pr-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="bg-card border border-card-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : contacts.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No contacts found</td></tr>
            ) : (
              contacts.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/contacts/${c.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                      {c.first_name} {c.last_name}
                    </Link>
                    {c.job_title && <p className="text-xs text-muted-foreground mt-0.5">{c.job_title}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {c.email ? (
                      <span className="flex items-center gap-1 text-muted-foreground"><Mail className="w-3 h-3" />{c.email}</span>
                    ) : <span className="text-muted-foreground">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    {c.phone ? (
                      <span className="flex items-center gap-1 text-muted-foreground"><Phone className="w-3 h-3" />{c.phone}</span>
                    ) : <span className="text-muted-foreground">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    {c.company ? (
                      <Link href={`/companies/${c.company.id}`} className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                        <Building2 className="w-3 h-3" />{c.company.name}
                      </Link>
                    ) : <span className="text-muted-foreground">-</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showNew && (
        <NewContactModal
          onClose={() => setShowNew(false)}
          onSuccess={() => { reload(); setShowNew(false); }}
        />
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useCompanies, createCompany } from "@/lib/api";
import { Plus, Search, X, Globe } from "lucide-react";

function NewCompanyModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createCompany({
        name,
        industry: industry || null,
        website: website || null,
        phone: phone || null,
        address: address || null,
        notes: notes || null,
      });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create company");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-card-border rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">New Company</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Company Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Industry</label>
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Technology" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Website</label>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} type="url" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
              {saving ? "Saving..." : "Save Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Companies() {
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [companies, setCompanies] = useState<Awaited<ReturnType<typeof useCompanies>["list"]>>([]);
  const [loading, setLoading] = useState(true);
  const { list: listCompanies } = useCompanies();

  const reload = useCallback(() => {
    setLoading(true);
    listCompanies(search || undefined)
      .then(setCompanies)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listCompanies, search]);

  useEffect(() => {
    const t = setTimeout(reload, 200);
    return () => clearTimeout(t);
  }, [reload]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Companies</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{companies.length} compan{companies.length !== 1 ? "ies" : "y"}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Company
        </button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies..." className="w-full border border-input rounded-md pl-9 pr-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="bg-card border border-card-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Industry</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Website</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : companies.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No companies found</td></tr>
            ) : (
              companies.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/companies/${c.id}`} className="font-medium text-foreground hover:text-primary transition-colors">{c.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.industry ?? "-"}</td>
                  <td className="px-4 py-3">
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <Globe className="w-3 h-3" />{c.website.replace("https://", "").replace("http://", "")}
                      </a>
                    ) : <span className="text-muted-foreground">-</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.phone ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showNew && (
        <NewCompanyModal
          onClose={() => setShowNew(false)}
          onSuccess={() => { reload(); setShowNew(false); }}
        />
      )}
    </div>
  );
}

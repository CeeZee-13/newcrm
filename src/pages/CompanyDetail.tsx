import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "wouter";
import { useCompany, useContacts, useDeals, updateCompany, deleteCompany } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import StageBadge from "@/components/StageBadge";
import { ArrowLeft, Plus, Trash2, Globe, Phone, MapPin, Building2, User } from "lucide-react";

export default function CompanyDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { get: getCompany } = useCompany();
  const { list: listContacts } = useContacts();
  const { list: listDeals } = useDeals();
  const [company, setCompany] = useState<Awaited<ReturnType<typeof getCompany>> | null>(null);
  const [contacts, setContacts] = useState<Awaited<ReturnType<typeof listContacts>>>([]);
  const [deals, setDeals] = useState<Awaited<ReturnType<typeof listDeals>>>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([getCompany(id), listContacts(), listDeals()])
      .then(([c, allContacts, allDeals]) => {
        setCompany(c);
        setContacts(allContacts.filter((ct) => ct.company_id === id));
        setDeals(allDeals.filter((d) => d.company_id === id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getCompany, listContacts, listDeals, id]);

  useEffect(() => {
    reload();
  }, [reload]);

  function startEdit() {
    if (!company) return;
    setName(company.name);
    setIndustry(company.industry ?? "");
    setWebsite(company.website ?? "");
    setPhone(company.phone ?? "");
    setAddress(company.address ?? "");
    setNotes(company.notes ?? "");
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateCompany(id, {
        name,
        industry: industry || null,
        website: website || null,
        phone: phone || null,
        address: address || null,
        notes: notes || null,
      });
      setEditing(false);
      reload();
    } catch {
      // silently
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this company? This cannot be undone.")) return;
    try {
      await deleteCompany(id);
      window.location.href = "/companies";
    } catch {
      // silently
    }
  }

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>;
  if (!company) return <div className="p-6 text-muted-foreground">Company not found.</div>;

  const totalDealValue = deals.reduce((s, d) => s + (d.total_value ?? 0), 0);

  return (
    <div className="p-6 space-y-6">
      <Link href="/companies" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Companies
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-blue-500 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
            {company.industry && <p className="text-sm text-muted-foreground">{company.industry}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <button onClick={startEdit} className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">Edit</button>
          ) : (
            <>
              <button onClick={() => setEditing(false)} className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">{saving ? "Saving..." : "Save"}</button>
            </>
          )}
          <button onClick={handleDelete} className="px-3 py-2 border border-border rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Company info */}
          <div className="bg-card border border-card-border rounded-lg p-5">
            <h2 className="font-semibold text-foreground mb-4">Company Information</h2>
            {!editing ? (
              <div className="space-y-3">
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Globe className="w-4 h-4" />{company.website.replace("https://", "").replace("http://", "")}
                  </a>
                )}
                {company.phone && <InfoRow icon={Phone} label="Phone" value={company.phone} />}
                {company.address && <InfoRow icon={MapPin} label="Address" value={company.address} />}
                {company.notes && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm text-foreground">{company.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Company Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Industry</label>
                    <input value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Website</label>
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} type="url" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Address</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
              </div>
            )}
          </div>

          {/* Contacts at this company */}
          <div className="bg-card border border-card-border rounded-lg p-5">
            <h2 className="font-semibold text-foreground mb-4">Contacts ({contacts.length})</h2>
            <div className="space-y-2">
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No contacts at this company</p>
              ) : (
                contacts.map((c) => (
                  <Link key={c.id} href={`/contacts/${c.id}`} className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/20 transition-colors">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.first_name} {c.last_name}</p>
                      {c.job_title && <p className="text-xs text-muted-foreground">{c.job_title}</p>}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Deals for this company */}
          <div className="bg-card border border-card-border rounded-lg p-5">
            <h2 className="font-semibold text-foreground mb-4">Deals ({deals.length})</h2>
            <div className="space-y-2">
              {deals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No deals for this company</p>
              ) : (
                deals.map((d) => (
                  <Link key={d.id} href={`/deals/${d.id}`} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(d.total_value)}</p>
                    </div>
                    <StageBadge stage={d.stage} />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          <div className="bg-card border border-card-border rounded-lg p-5">
            <h2 className="font-semibold text-foreground mb-4">Summary</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Deal Value</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalDealValue, true)}</p>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Contacts</p>
                <p className="text-lg font-semibold text-foreground">{contacts.length}</p>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Active Deals</p>
                <p className="text-lg font-semibold text-foreground">
                  {deals.filter((d) => !["closed_won", "closed_lost"].includes(d.stage)).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

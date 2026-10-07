import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "wouter";
import { useContact, useDeals, useActivities, useCompanies, updateContact, deleteContact } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import StageBadge from "@/components/StageBadge";
import ActivityBadge from "@/components/ActivityBadge";
import ActivityModal from "@/components/ActivityModal";
import { ArrowLeft, Plus, Trash2, Mail, Phone, Building2 } from "lucide-react";

export default function ContactDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { get: getContact } = useContact();
  const { list: listDeals } = useDeals();
  const { list: listActivities } = useActivities();
  const { list: listCompanies } = useCompanies();
  const [contact, setContact] = useState<Awaited<ReturnType<typeof getContact>> | null>(null);
  const [deals, setDeals] = useState<Awaited<ReturnType<typeof listDeals>>>([]);
  const [activities, setActivities] = useState<Awaited<ReturnType<typeof listActivities>>>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([getContact(id), listDeals(), listActivities({ contactId: id })])
      .then(([c, d, a]) => {
        setContact(c);
        setDeals(d.filter((dl) => dl.contact_id === id));
        setActivities(a);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getContact, listDeals, listActivities, id]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    listCompanies().then(setCompanies).catch(() => {});
  }, []); // eslint-disable-line

  function startEdit() {
    if (!contact) return;
    setFirstName(contact.first_name);
    setLastName(contact.last_name);
    setEmail(contact.email ?? "");
    setPhone(contact.phone ?? "");
    setJobTitle(contact.job_title ?? "");
    setCompanyId(contact.company_id ?? "");
    setNotes(contact.notes ?? "");
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateContact(id, {
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        phone: phone || null,
        job_title: jobTitle || null,
        company_id: companyId || null,
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
    if (!confirm("Delete this contact? This cannot be undone.")) return;
    try {
      await deleteContact(id);
      window.location.href = "/contacts";
    } catch {
      // silently
    }
  }

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>;
  if (!contact) return <div className="p-6 text-muted-foreground">Contact not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <Link href="/contacts" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Contacts
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
            {contact.first_name[0]}{contact.last_name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{contact.first_name} {contact.last_name}</h1>
            {contact.job_title && <p className="text-sm text-muted-foreground">{contact.job_title}</p>}
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
          {/* Contact info / edit */}
          <div className="bg-card border border-card-border rounded-lg p-5">
            <h2 className="font-semibold text-foreground mb-4">Contact Information</h2>
            {!editing ? (
              <div className="space-y-3">
                {contact.email && <InfoRow icon={Mail} label="Email" value={contact.email} />}
                {contact.phone && <InfoRow icon={Phone} label="Phone" value={contact.phone} />}
                {contact.company && (
                  <Link href={`/companies/${contact.company.id}`} className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                    <Building2 className="w-4 h-4 text-muted-foreground" />{contact.company.name}
                  </Link>
                )}
                {contact.notes && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm text-foreground">{contact.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">First Name</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Last Name</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Job Title</label>
                    <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Company</label>
                  <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">No company</option>
                    {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
              </div>
            )}
          </div>

          {/* Deals */}
          <div className="bg-card border border-card-border rounded-lg p-5">
            <h2 className="font-semibold text-foreground mb-4">Deals</h2>
            <div className="space-y-2">
              {deals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No deals linked</p>
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

          {/* Activities */}
          <div className="bg-card border border-card-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Activities</h2>
              <button onClick={() => setShowActivity(true)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors">
                <Plus className="w-3 h-3" /> Add Activity
              </button>
            </div>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No activities yet</p>
              ) : (
                activities.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-md bg-muted/20">
                    <ActivityBadge type={a.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{a.title}</p>
                      {a.description && <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>}
                      <p className="text-xs text-muted-foreground/70 mt-0.5">{formatDateTime(a.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showActivity && (
        <ActivityModal
          contactId={id}
          onClose={() => setShowActivity(false)}
          onSuccess={() => { reload(); setShowActivity(false); }}
        />
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

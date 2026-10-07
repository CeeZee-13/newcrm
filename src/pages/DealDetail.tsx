import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "wouter";
import { useDeal, useActivities, updateDeal, deleteDeal, useContacts, useCompanies } from "@/lib/api";
import { formatCurrency, formatDate, formatDateTime, STAGES } from "@/lib/utils";
import StageBadge from "@/components/StageBadge";
import ActivityBadge from "@/components/ActivityBadge";
import ActivityModal from "@/components/ActivityModal";
import { ArrowLeft, Plus, Trash2, Building2, User } from "lucide-react";

export default function DealDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { get: getDeal } = useDeal();
  const { list: listActivities } = useActivities();
  const { list: listContacts } = useContacts();
  const { list: listCompanies } = useCompanies();
  const [deal, setDeal] = useState<Awaited<ReturnType<typeof getDeal>> | null>(null);
  const [activities, setActivities] = useState<Awaited<ReturnType<typeof listActivities>>>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [contacts, setContacts] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);

  // Edit form state
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState("lead");
  const [capex, setCapex] = useState("");
  const [opex, setOpex] = useState("");
  const [probability, setProbability] = useState("");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [description, setDescription] = useState("");
  const [contactId, setContactId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [saving, setSaving] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([getDeal(id), listActivities({ dealId: id })])
      .then(([d, a]) => { setDeal(d); setActivities(a); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getDeal, listActivities, id]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    listContacts().then(setContacts).catch(() => {});
    listCompanies().then(setCompanies).catch(() => {});
  }, []); // eslint-disable-line

  function startEdit() {
    if (!deal) return;
    setTitle(deal.title);
    setStage(deal.stage);
    setCapex(deal.capex?.toString() ?? "");
    setOpex(deal.opex?.toString() ?? "");
    setProbability(deal.probability?.toString() ?? "");
    setExpectedCloseDate(deal.expected_close_date ?? "");
    setDescription(deal.description ?? "");
    setContactId(deal.contact_id ?? "");
    setCompanyId(deal.company_id ?? "");
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateDeal(id, {
        title,
        stage,
        capex: capex ? parseFloat(capex) : null,
        opex: opex ? parseFloat(opex) : null,
        probability: probability ? parseInt(probability) : null,
        expected_close_date: expectedCloseDate || null,
        description: description || null,
        contact_id: contactId || null,
        company_id: companyId || null,
      });
      setEditing(false);
      reload();
    } catch {
      // handled silently
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this deal? This cannot be undone.")) return;
    try {
      await deleteDeal(id);
      window.location.href = "/deals";
    } catch {
      // handled silently
    }
  }

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  if (!deal) {
    return <div className="p-6 text-muted-foreground">Deal not found.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Link href="/deals" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Deals
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-foreground">{deal.title}</h1>
            <StageBadge stage={deal.stage} />
          </div>
          <p className="text-sm text-muted-foreground">
            Created {formatDate(deal.created_at)}
            {deal.probability != null && ` - ${deal.probability}% probability`}
          </p>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <button onClick={startEdit} className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">
              Edit
            </button>
          ) : (
            <>
              <button onClick={() => setEditing(false)} className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}
          <button onClick={handleDelete} className="px-3 py-2 border border-border rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-card-border rounded-lg p-5">
            <h2 className="font-semibold text-foreground mb-4">Deal Information</h2>
            {!editing ? (
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Capex" value={formatCurrency(deal.capex)} />
                <InfoRow label="Opex" value={formatCurrency(deal.opex)} />
                <InfoRow label="Total Value" value={formatCurrency(deal.total_value)} />
                <InfoRow label="Currency" value={deal.currency} />
                <InfoRow label="Probability" value={deal.probability != null ? `${deal.probability}%` : "-"} />
                <InfoRow label="Expected Close" value={formatDate(deal.expected_close_date)} />
                {deal.description && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground">{deal.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Stage</label>
                    <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                      {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Probability (%)</label>
                    <input value={probability} onChange={(e) => setProbability(e.target.value)} type="number" min="0" max="100" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Capex</label>
                    <input value={capex} onChange={(e) => setCapex(e.target.value)} type="number" step="0.01" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Opex</label>
                    <input value={opex} onChange={(e) => setOpex(e.target.value)} type="number" step="0.01" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Expected Close Date</label>
                  <input value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} type="date" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Contact</label>
                    <select value={contactId} onChange={(e) => setContactId(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">No contact</option>
                      {contacts.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Company</label>
                    <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">No company</option>
                      {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
              </div>
            )}
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
                <p className="text-sm text-muted-foreground text-center py-6">No activities yet</p>
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

        {/* Sidebar info */}
        <div className="space-y-4">
          {deal.company && (
            <div className="bg-card border border-card-border rounded-lg p-5">
              <h2 className="font-semibold text-foreground mb-3">Company</h2>
              <Link href={`/companies/${deal.company.id}`} className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                {deal.company.name}
              </Link>
              {deal.company.industry && <p className="text-xs text-muted-foreground mt-2">{deal.company.industry}</p>}
            </div>
          )}
          {deal.contact && (
            <div className="bg-card border border-card-border rounded-lg p-5">
              <h2 className="font-semibold text-foreground mb-3">Contact</h2>
              <Link href={`/contacts/${deal.contact.id}`} className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                <User className="w-4 h-4 text-muted-foreground" />
                {deal.contact.first_name} {deal.contact.last_name}
              </Link>
              {deal.contact.job_title && <p className="text-xs text-muted-foreground mt-2">{deal.contact.job_title}</p>}
              {deal.contact.email && <p className="text-xs text-muted-foreground mt-1">{deal.contact.email}</p>}
            </div>
          )}
        </div>
      </div>

      {showActivity && (
        <ActivityModal
          dealId={id}
          onClose={() => setShowActivity(false)}
          onSuccess={() => { reload(); setShowActivity(false); }}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useDeals } from "@/lib/api";
import { formatCurrency, formatDate, STAGES } from "@/lib/utils";
import StageBadge from "@/components/StageBadge";
import NewDealModal from "@/components/NewDealModal";
import { Plus, Search, Building2, User } from "lucide-react";

export default function Deals() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [deals, setDeals] = useState<Awaited<ReturnType<typeof useDeals>["list"]>>([]);
  const [loading, setLoading] = useState(true);
  const { list: listDeals } = useDeals();

  const reload = useCallback(() => {
    setLoading(true);
    listDeals(search || undefined, stageFilter || undefined)
      .then(setDeals)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listDeals, search, stageFilter]);

  useEffect(() => {
    const t = setTimeout(reload, 200);
    return () => clearTimeout(t);
  }, [reload]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{deals.length} deal{deals.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowNewDeal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Deal
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals..."
            className="w-full border border-input rounded-md pl-9 pr-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-card-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deal</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stage</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Capex</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Opex</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Close Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : deals.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No deals found</td></tr>
            ) : (
              deals.map((deal) => (
                <tr key={deal.id} className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/deals/${deal.id}`} className="font-medium text-foreground hover:text-primary transition-colors">{deal.title}</Link>
                    {deal.contact && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3" />{deal.contact.first_name} {deal.contact.last_name}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3"><StageBadge stage={deal.stage} /></td>
                  <td className="px-4 py-3">
                    {deal.company ? (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Building2 className="w-3 h-3" />{deal.company.name}
                      </span>
                    ) : <span className="text-muted-foreground">-</span>}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(deal.capex)}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(deal.opex)}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(deal.total_value)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(deal.expected_close_date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showNewDeal && (
        <NewDealModal
          onClose={() => setShowNewDeal(false)}
          onSuccess={() => { reload(); setShowNewDeal(false); }}
        />
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useDeals, updateDeal } from "@/lib/api";
import { formatCurrency, STAGES } from "@/lib/utils";
import StageBadge from "@/components/StageBadge";
import NewDealModal from "@/components/NewDealModal";
import { Plus } from "lucide-react";

export default function Pipeline() {
  const { list: listDeals } = useDeals();
  const [deals, setDeals] = useState<Awaited<ReturnType<typeof listDeals>>>([]);
  const [loading, setLoading] = useState(true);
  const [dragDealId, setDragDealId] = useState<string | null>(null);
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [newDealStage, setNewDealStage] = useState("lead");

  const reload = useCallback(() => {
    setLoading(true);
    listDeals()
      .then(setDeals)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listDeals]);

  useEffect(() => {
    reload();
  }, [reload]);

  const dealsByStage = STAGES.reduce(
    (acc, s) => {
      acc[s.key] = deals.filter((d) => d.stage === s.key);
      return acc;
    },
    {} as Record<string, typeof deals>
  );

  function handleDrop(targetStage: string) {
    if (!dragDealId) return;
    const deal = deals.find((d) => d.id === dragDealId);
    if (!deal || deal.stage === targetStage) {
      setDragDealId(null);
      return;
    }
    updateDeal(dragDealId, { stage: targetStage })
      .then(() => reload())
      .catch(() => {})
      .finally(() => setDragDealId(null));
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{deals.length} total deals</p>
        </div>
        <button
          onClick={() => { setNewDealStage("lead"); setShowNewDeal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Deal
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageDeals = dealsByStage[stage.key] ?? [];
          const totalValue = stageDeals.reduce((sum, d) => sum + (d.total_value ?? 0), 0);
          return (
            <div
              key={stage.key}
              className="flex-shrink-0 w-72 flex flex-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage.key)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StageBadge stage={stage.key} />
                  <span className="text-xs text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                    {stageDeals.length}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{formatCurrency(totalValue)}</span>
              </div>

              <div className="flex-1 space-y-2 min-h-[100px] rounded-lg bg-muted/30 p-2 border border-border/60">
                {loading ? (
                  <div className="text-xs text-muted-foreground text-center py-4">Loading...</div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => setDragDealId(deal.id)}
                      className="bg-card border border-card-border rounded-md p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
                    >
                      <Link href={`/deals/${deal.id}`} className="block">
                        <p className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">{deal.title}</p>
                        {deal.company?.name && (
                          <p className="text-xs text-muted-foreground mt-1">{deal.company.name}</p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">{formatCurrency(deal.total_value)}</span>
                          {deal.probability != null && (
                            <span className="text-xs text-muted-foreground">{deal.probability}%</span>
                          )}
                        </div>
                        {(deal.capex != null || deal.opex != null) && (
                          <div className="mt-1.5 flex gap-2 text-xs text-muted-foreground">
                            {deal.capex != null && <span>Capex: {formatCurrency(deal.capex)}</span>}
                            {deal.opex != null && <span>Opex: {formatCurrency(deal.opex)}</span>}
                          </div>
                        )}
                      </Link>
                    </div>
                  ))
                )}

                <button
                  onClick={() => { setNewDealStage(stage.key); setShowNewDeal(true); }}
                  className="w-full flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add deal
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showNewDeal && (
        <NewDealModal
          defaultStage={newDealStage}
          onClose={() => setShowNewDeal(false)}
          onSuccess={() => { reload(); setShowNewDeal(false); }}
        />
      )}
    </div>
  );
}

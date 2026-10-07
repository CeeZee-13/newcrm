import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useDeals, useActivities } from "@/lib/api";
import { formatCurrency, formatDateTime, STAGES, STAGE_BAR_COLORS } from "@/lib/utils";
import StageBadge from "@/components/StageBadge";
import ActivityBadge from "@/components/ActivityBadge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Briefcase, Users, Building2, TrendingUp, DollarSign, CircleCheck as CheckCircle, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { list: listDeals } = useDeals();
  const { list: listActivities } = useActivities();
  const [deals, setDeals] = useState<Awaited<ReturnType<typeof listDeals>>>([]);
  const [activities, setActivities] = useState<Awaited<ReturnType<typeof listActivities>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([listDeals(), listActivities()])
      .then(([d, a]) => {
        setDeals(d);
        setActivities(a.slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const stats = useMemo(() => {
    const totalRevenue = deals
      .filter((d) => d.stage === "closed_won")
      .reduce((sum, d) => sum + (d.total_value ?? 0), 0);
    const pipelineValue = deals
      .filter((d) => !["closed_won", "closed_lost"].includes(d.stage))
      .reduce((sum, d) => sum + (d.total_value ?? 0), 0);
    const wonCount = deals.filter((d) => d.stage === "closed_won").length;
    const activeCount = deals.filter((d) => !["closed_won", "closed_lost"].includes(d.stage)).length;
    return { totalRevenue, pipelineValue, wonCount, activeCount };
  }, [deals]);

  const stageData = useMemo(() => {
    return STAGES.map((s) => ({
      name: s.label,
      value: deals.filter((d) => d.stage === s.key).length,
      key: s.key,
    }));
  }, [deals]);

  const cards = [
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue, true), icon: DollarSign, color: "bg-blue-500" },
    { label: "Pipeline Value", value: formatCurrency(stats.pipelineValue, true), icon: TrendingUp, color: "bg-green-500" },
    { label: "Won Deals", value: String(stats.wonCount), icon: CheckCircle, color: "bg-emerald-500" },
    { label: "Active Deals", value: String(stats.activeCount), icon: Briefcase, color: "bg-orange-500" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Overview of your sales pipeline and revenue</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-card border border-card-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-md ${card.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Deals by stage chart */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-lg p-5">
          <h2 className="font-semibold text-foreground mb-4">Deals by Stage</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stageData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--popover-border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stageData.map((entry, i) => (
                    <Cell key={i} fill={STAGE_BAR_COLORS[entry.key] ?? "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-card border border-card-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Activity</h2>
            <Link href="/analytics" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <ActivityBadge type={a.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(a.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active deals list */}
      <div className="bg-card border border-card-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Active Deals</h2>
          <Link href="/deals" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {deals.filter((d) => !["closed_won", "closed_lost"].includes(d.stage)).slice(0, 5).map((deal) => (
            <Link
              key={deal.id}
              href={`/deals/${deal.id}`}
              className="flex items-center justify-between p-3 rounded-md hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{deal.title}</p>
                  <p className="text-xs text-muted-foreground">{deal.company?.name ?? "No company"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <StageBadge stage={deal.stage} />
                <span className="text-sm font-semibold text-foreground">{formatCurrency(deal.total_value)}</span>
              </div>
            </Link>
          ))}
          {deals.filter((d) => !["closed_won", "closed_lost"].includes(d.stage)).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No active deals</p>
          )}
        </div>
      </div>
    </div>
  );
}

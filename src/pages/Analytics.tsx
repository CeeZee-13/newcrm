import { useState, useEffect, useMemo } from "react";
import { useDeals, useActivities } from "@/lib/api";
import { formatCurrency, formatDateTime, STAGES, STAGE_BAR_COLORS } from "@/lib/utils";
import StageBadge from "@/components/StageBadge";
import ActivityBadge from "@/components/ActivityBadge";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Trophy, Target, Activity as ActivityIcon } from "lucide-react";

export default function Analytics() {
  const { list: listDeals } = useDeals();
  const { list: listActivities } = useActivities();
  const [deals, setDeals] = useState<Awaited<ReturnType<typeof listDeals>>>([]);
  const [activities, setActivities] = useState<Awaited<ReturnType<typeof listActivities>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([listDeals(), listActivities()])
      .then(([d, a]) => { setDeals(d); setActivities(a); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const stats = useMemo(() => {
    const wonDeals = deals.filter((d) => d.stage === "closed_won");
    const lostDeals = deals.filter((d) => d.stage === "closed_lost");
    const totalRevenue = wonDeals.reduce((s, d) => s + (d.total_value ?? 0), 0);
    const avgDealSize = wonDeals.length ? totalRevenue / wonDeals.length : 0;
    const winRate = wonDeals.length + lostDeals.length > 0
      ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100)
      : 0;
    const pipelineValue = deals
      .filter((d) => !["closed_won", "closed_lost"].includes(d.stage))
      .reduce((s, d) => s + (d.total_value ?? 0), 0);
    return { totalRevenue, avgDealSize, winRate, pipelineValue, wonCount: wonDeals.length };
  }, [deals]);

  const stageData = useMemo(() => {
    return STAGES.map((s) => {
      const stageDeals = deals.filter((d) => d.stage === s.key);
      return {
        name: s.label,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + (d.total_value ?? 0), 0),
        key: s.key,
      };
    });
  }, [deals]);

  const pieData = useMemo(() => {
    return STAGES.filter((s) => s.key !== "closed_lost").map((s) => {
      const stageDeals = deals.filter((d) => d.stage === s.key);
      return {
        name: s.label,
        value: stageDeals.reduce((sum, d) => sum + (d.total_value ?? 0), 0),
        key: s.key,
      };
    }).filter((d) => d.value > 0);
  }, [deals]);

  const cards = [
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue, true), icon: DollarSign, color: "bg-blue-500", trend: "+12%" },
    { label: "Avg Deal Size", value: formatCurrency(stats.avgDealSize, true), icon: Target, color: "bg-green-500", trend: "+5%" },
    { label: "Win Rate", value: `${stats.winRate}%`, icon: Trophy, color: "bg-amber-500", trend: stats.winRate >= 50 ? "+8%" : "-3%" },
    { label: "Pipeline Value", value: formatCurrency(stats.pipelineValue, true), icon: TrendingUp, color: "bg-orange-500", trend: "+15%" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Detailed insights into your sales performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isPositive = !card.trend.startsWith("-");
          return (
            <div key={card.label} className="bg-card border border-card-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-md ${card.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${isPositive ? "text-green-500" : "text-red-500"}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stage value bar chart */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-lg p-5">
          <h2 className="font-semibold text-foreground mb-4">Deal Value by Stage</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCurrency(v, true)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--popover-border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(v: number) => formatCurrency(v)}
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

        {/* Pipeline distribution pie */}
        <div className="bg-card border border-card-border rounded-lg p-5">
          <h2 className="font-semibold text-foreground mb-4">Revenue Distribution</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          ) : pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={STAGE_BAR_COLORS[entry.key] ?? "#3b82f6"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--popover-border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Deal count by stage */}
      <div className="bg-card border border-card-border rounded-lg p-5">
        <h2 className="font-semibold text-foreground mb-4">Deal Count by Stage</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stageData.map((s) => (
            <div key={s.key} className="text-center p-3 rounded-lg bg-muted/30 border border-border/60">
              <div
                className="w-3 h-3 rounded-full mx-auto mb-2"
                style={{ backgroundColor: STAGE_BAR_COLORS[s.key] ?? "#3b82f6" }}
              />
              <p className="text-2xl font-bold text-foreground">{s.count}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.name}</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">{formatCurrency(s.value, true)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Full activity feed */}
      <div className="bg-card border border-card-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <ActivityIcon className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Activity Feed</h2>
        </div>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activities recorded</p>
          ) : (
            activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/20 transition-colors">
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
  );
}

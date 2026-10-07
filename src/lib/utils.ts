import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined, compact = false): string {
  if (value == null) return "-";
  if (compact && Math.abs(value) >= 1000000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const STAGES = [
  { key: "lead", label: "Lead" },
  { key: "appointment_scheduled", label: "Appointment Scheduled" },
  { key: "demo_given", label: "Demo Given" },
  { key: "contract_sent", label: "Contract Sent" },
  { key: "closed_won", label: "Closed Won" },
  { key: "closed_lost", label: "Closed Lost" },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];

export const STAGE_COLORS: Record<string, string> = {
  lead: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50",
  appointment_scheduled: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50",
  demo_given: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
  contract_sent: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/50",
  closed_won: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900/50",
  closed_lost: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50",
};

export const STAGE_BAR_COLORS: Record<string, string> = {
  lead: "#3b82f6",
  appointment_scheduled: "#a855f7",
  demo_given: "#f59e0b",
  contract_sent: "#f97316",
  closed_won: "#22c55e",
  closed_lost: "#ef4444",
};

export function stageLabel(key: string): string {
  return STAGES.find((s) => s.key === key)?.label ?? key;
}

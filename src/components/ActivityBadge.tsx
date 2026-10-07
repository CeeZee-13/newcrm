import { cn } from "@/lib/utils";
import { FileText, Users, Phone } from "lucide-react";

const icons: Record<string, typeof FileText> = {
  note: FileText,
  meeting: Users,
  call: Phone,
};

const colors: Record<string, string> = {
  note: "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
  meeting: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  call: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};

export default function ActivityBadge({ type, className }: { type: string; className?: string }) {
  const Icon = icons[type] ?? FileText;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize",
        colors[type] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {type}
    </span>
  );
}

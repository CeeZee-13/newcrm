import { cn, STAGE_COLORS, stageLabel } from "@/lib/utils";

export default function StageBadge({ stage, className }: { stage: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        STAGE_COLORS[stage] ?? "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
        className
      )}
    >
      {stageLabel(stage)}
    </span>
  );
}

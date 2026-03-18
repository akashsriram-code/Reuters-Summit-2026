import { CalendarDays } from "lucide-react";

type EmptyStateProps = {
  compact?: boolean;
};

export default function EmptyState({ compact = false }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-white/[0.03] text-center ${
        compact ? "px-6 py-10" : "px-8 py-16"
      }`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-reuters-red/10 text-reuters-red">
        <CalendarDays className="h-8 w-8" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">No guests added yet</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/65">
        No guests added yet. Click &quot;+ Add Guest&quot; to get started.
      </p>
    </div>
  );
}

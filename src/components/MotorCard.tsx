import { cn } from "@/lib/utils";
import { StatusBadge, type StatusVariant } from "./StatusBadge";

interface MotorCardProps {
  name: string;
  facility: string;
  machine: string;
  status: StatusVariant;
  specName?: string;
  lastInspection?: string;
  score?: number;
  onClick?: () => void;
}

const borderColorMap: Record<StatusVariant, string> = {
  healthy: "border-l-status-healthy",
  warning: "border-l-status-warning",
  critical: "border-l-status-critical",
  unknown: "border-l-muted-foreground",
  active: "border-l-primary",
};

export function MotorCard({
  name,
  facility,
  machine,
  status,
  specName,
  lastInspection,
  score,
  onClick,
}: MotorCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card rounded-lg border-l-4 shadow-sm p-6 cursor-pointer",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        borderColorMap[status]
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            status === "healthy" && "bg-status-healthy",
            status === "warning" && "bg-status-warning",
            status === "critical" && "bg-status-critical status-dot-pulse",
            status === "unknown" && "bg-muted-foreground",
          )}
        />
        <h3 className="text-md font-semibold text-foreground">{name}</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {facility} · {machine}
      </p>

      {specName && (
        <span className="inline-block text-xs font-medium bg-surface-raised text-muted-foreground px-2 py-1 rounded mb-3">
          {specName}
        </span>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{lastInspection ? `Last: ${lastInspection}` : "No inspections"}</span>
        <div className="flex items-center gap-2">
          {score !== undefined && <span>Score: {score}</span>}
          <StatusBadge variant={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </StatusBadge>
        </div>
      </div>
    </div>
  );
}

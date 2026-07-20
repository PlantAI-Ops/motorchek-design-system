import { cn } from "@/lib/utils";
import { StatusBadge, type StatusVariant } from "./StatusBadge";

interface MotorCardProps {
  name: string;
  facility: string;
  machine: string;
  model: string;
  manufacturer: string;
  status: StatusVariant;
  lastInspectionDate?: string;
  lastInspectionScore?: number;
  lastInspectionStatus?: StatusVariant;
  onClick?: () => void;
}

const borderColorMap: Record<StatusVariant, string> = {
  healthy: "border-l-status-healthy",
  warning: "border-l-status-warning",
  critical: "border-l-status-critical",
  unknown: "border-l-muted-foreground",
  active: "border-l-primary",
};

const statusDotColor: Record<StatusVariant, string> = {
  healthy: "bg-status-healthy",
  warning: "bg-status-warning",
  critical: "bg-status-critical status-dot-pulse",
  unknown: "bg-muted-foreground",
  active: "bg-primary",
};

export function MotorCard({
  name,
  facility,
  machine,
  model,
  manufacturer,
  status,
  lastInspectionDate,
  lastInspectionScore,
  lastInspectionStatus,
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
            statusDotColor[status]
          )}
        />
        <h3 className="text-md font-semibold text-foreground">{name}</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-1">
        {facility}
      </p>

      <p className="text-sm text-muted-foreground mb-2">
        {machine}
      </p>

      <p className="text-sm text-muted-foreground mb-2">
        {model} · {manufacturer}
      </p>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            {lastInspectionDate
              ? `Last: ${lastInspectionDate}`
              : "No inspections"}
          </span>
          {lastInspectionStatus && (
            <>
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  statusDotColor[lastInspectionStatus]
                )}
              />
              <StatusBadge variant={lastInspectionStatus}>
                {lastInspectionStatus.charAt(0).toUpperCase() + lastInspectionStatus.slice(1)}
              </StatusBadge>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastInspectionScore !== undefined && (
            <span>Score: {lastInspectionScore}</span>
          )}
          <StatusBadge variant={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </StatusBadge>
        </div>
      </div>
    </div>
  );
}

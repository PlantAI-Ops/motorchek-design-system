import { cn } from "@/lib/utils";

export type StatusVariant = "healthy" | "warning" | "critical" | "unknown" | "active";

const variantStyles: Record<StatusVariant, string> = {
  healthy: "bg-status-healthy-bg text-status-healthy",
  warning: "bg-status-warning-bg text-status-warning",
  critical: "bg-status-critical-bg text-status-critical",
  unknown: "bg-muted text-muted-foreground",
  active: "bg-accent-subtle text-primary",
};

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      role="status"
      aria-label={`Status: ${variant}`}
      className={cn(
        "inline-flex items-center h-6 px-3 rounded-full text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

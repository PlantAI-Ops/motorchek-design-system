import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { MotorCard } from "@/components/MotorCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Cpu, CheckCircle, Wrench, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listMotors } from "@/lib/api/motors";
import type { StatusVariant } from "@/components/StatusBadge";

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: motors = [], isLoading } = useQuery({
    queryKey: ["motors"],
    queryFn: () => listMotors(0, 100),
  });

  const attentionMotors = motors.filter(
    (m) => m.status === "warning" || m.status === "critical"
  );

  const recentInspections = [
    { motor: "Pump Motor A1", timestamp: "2026-04-10 09:14", shift: "Morning", temp: 72, vib: 1.2, status: "healthy" as const, score: 92 },
    { motor: "Compressor Drive B3", timestamp: "2026-04-10 06:30", shift: "Morning", temp: 82, vib: 2.1, status: "warning" as const, score: 65 },
    { motor: "Conveyor Motor C2", timestamp: "2026-04-09 14:22", shift: "Afternoon", temp: 95, vib: 4.8, status: "critical" as const, score: 34 },
    { motor: "Fan Motor D1", timestamp: "2026-04-10 07:45", shift: "Morning", temp: 68, vib: 0.9, status: "healthy" as const, score: 88 },
    { motor: "Agitator Motor F2", timestamp: "2026-04-09 22:10", shift: "Night", temp: 79, vib: 2.5, status: "warning" as const, score: 58 },
  ];

  return (
    <AppLayout title="Dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard title="Total Motors" value={motors.length} subtitle="Across facilities" icon={Cpu} />
        <KpiCard title="Healthy" value={motors.filter(m => m.status === "healthy").length} subtitle={`${motors.length ? Math.round((motors.filter(m => m.status === "healthy").length / motors.length) * 100) : 0}% of fleet`} icon={CheckCircle} />
        <KpiCard title="Inspections Today" value={4} subtitle="Morning shift" icon={Wrench} />
        <KpiCard title="Pending Alerts" value={attentionMotors.length} subtitle={`${motors.filter(m => m.status === "critical").length} critical · ${motors.filter(m => m.status === "warning").length} warnings`} icon={AlertTriangle} />
      </div>

      {/* Recent Inspections */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Inspections</h2>
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-raised border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Motor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timestamp</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shift</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Temp °C</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vibration</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                </tr>
              </thead>
              <tbody>
                {recentInspections.map((insp, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0 hover:bg-accent-subtle transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{insp.motor}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{insp.timestamp}</td>
                    <td className="px-4 py-3 text-muted-foreground">{insp.shift}</td>
                    <td className="px-4 py-3 text-right text-foreground">{insp.temp}</td>
                    <td className="px-4 py-3 text-right text-foreground">{insp.vib}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge variant={insp.status}>
                        {insp.status.charAt(0).toUpperCase() + insp.status.slice(1)}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{insp.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-border">
            {recentInspections.map((insp, i) => (
              <div key={i} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{insp.motor}</span>
                  <StatusBadge variant={insp.status}>
                    {insp.status.charAt(0).toUpperCase() + insp.status.slice(1)}
                  </StatusBadge>
                </div>
                <p className="text-xs font-mono text-muted-foreground">{insp.timestamp} · {insp.shift}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Temp: {insp.temp}°C</span>
                  <span>Vib: {insp.vib}</span>
                  <span className="ml-auto font-semibold text-foreground">Score: {insp.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Motors Requiring Attention */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Motors Requiring Attention</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border bg-card">
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : attentionMotors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {attentionMotors.map((motor) => (
              <MotorCard
                key={motor.id}
                name={motor.name}
                facility={motor.facility}
                machine={motor.machine}
                model={motor.model}
                manufacturer={motor.manufacturer}
                status={(motor.status as StatusVariant) ?? "unknown"}
                lastInspectionDate={motor.last_inspection_date}
                lastInspectionScore={motor.last_inspection_score}
                lastInspectionStatus={(motor.last_inspection_status as StatusVariant) ?? undefined}
                onClick={() => navigate(`/motors/${motor.id}`)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No motors requiring attention.</p>
        )}
      </section>
    </AppLayout>
  );
}

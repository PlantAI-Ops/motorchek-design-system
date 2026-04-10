import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { MotorCard } from "@/components/MotorCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Cpu, CheckCircle, Wrench, AlertTriangle } from "lucide-react";

const mockMotors = [
  { name: "Pump Motor A1", facility: "FAC-001", machine: "MCH-042", status: "healthy" as const, specName: "ABB M3BP-160", lastInspection: "2h ago", score: 92 },
  { name: "Compressor Drive B3", facility: "FAC-001", machine: "MCH-018", status: "warning" as const, specName: "Siemens 1LE1", lastInspection: "6h ago", score: 65 },
  { name: "Conveyor Motor C2", facility: "FAC-002", machine: "MCH-091", status: "critical" as const, specName: "WEG W22", lastInspection: "1d ago", score: 34 },
  { name: "Fan Motor D1", facility: "FAC-002", machine: "MCH-055", status: "healthy" as const, lastInspection: "4h ago", score: 88 },
  { name: "Mixer Motor E4", facility: "FAC-003", machine: "MCH-112", status: "unknown" as const },
  { name: "Agitator Motor F2", facility: "FAC-001", machine: "MCH-073", status: "warning" as const, specName: "ABB M3AA-100", lastInspection: "12h ago", score: 58 },
];

const recentInspections = [
  { motor: "Pump Motor A1", timestamp: "2026-04-10 09:14", shift: "Morning", temp: 72, vib: 1.2, status: "healthy" as const, score: 92 },
  { motor: "Compressor Drive B3", timestamp: "2026-04-10 06:30", shift: "Morning", temp: 82, vib: 2.1, status: "warning" as const, score: 65 },
  { motor: "Conveyor Motor C2", timestamp: "2026-04-09 14:22", shift: "Afternoon", temp: 95, vib: 4.8, status: "critical" as const, score: 34 },
  { motor: "Fan Motor D1", timestamp: "2026-04-10 07:45", shift: "Morning", temp: 68, vib: 0.9, status: "healthy" as const, score: 88 },
  { motor: "Agitator Motor F2", timestamp: "2026-04-09 22:10", shift: "Night", temp: 79, vib: 2.5, status: "warning" as const, score: 58 },
];

export default function DashboardPage() {
  return (
    <AppLayout title="Dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard title="Total Motors" value={6} subtitle="Across 3 facilities" icon={Cpu} />
        <KpiCard title="Healthy" value="3" subtitle="50% of fleet" icon={CheckCircle} />
        <KpiCard title="Inspections Today" value={4} subtitle="Morning shift" icon={Wrench} />
        <KpiCard title="Pending Alerts" value={3} subtitle="1 critical · 2 warnings" icon={AlertTriangle} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockMotors
            .filter((m) => m.status === "warning" || m.status === "critical")
            .map((motor) => (
              <MotorCard key={motor.name} {...motor} />
            ))}
        </div>
      </section>
    </AppLayout>
  );
}

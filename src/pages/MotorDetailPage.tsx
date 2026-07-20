import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Hash, Activity, MapPin, Box, Factory, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getMotor } from "@/lib/api/motors";
import type { StatusVariant } from "@/components/StatusBadge";

const statusBorderMap: Record<string, string> = {
  healthy: "border-l-status-healthy",
  warning: "border-l-status-warning",
  critical: "border-l-status-critical",
  unknown: "border-l-muted-foreground",
};

export default function MotorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: motor, isLoading } = useQuery({
    queryKey: ["motor", id],
    queryFn: () => getMotor(id!),
    enabled: !!id,
  });

  // Mock inspection data for now — to be replaced with real inspections API
  const inspections = [
    { id: "i1", motorId: id, timestamp: "2026-04-10T09:14:00Z", shift: "Day", temperature: 72, vibration: 2.1, noise: 68, condition: "Normal", status: "healthy", score: 88 },
    { id: "i2", motorId: id, timestamp: "2026-04-08T14:30:00Z", shift: "Day", temperature: 74, vibration: 2.3, noise: 70, condition: "Normal", status: "healthy", score: 85 },
    { id: "i3", motorId: id, timestamp: "2026-04-05T22:10:00Z", shift: "Night", temperature: 71, vibration: 2.0, noise: 67, condition: "Normal", status: "healthy", score: 90 },
  ];

  const chartData = useMemo(
    () =>
      [...inspections]
        .reverse()
        .map((i) => ({
          date: new Date(i.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          temperature: i.temperature,
          vibration: i.vibration,
        })),
    [inspections]
  );

  if (isLoading) {
    return (
      <AppLayout title="Loading…">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!motor) {
    return (
      <AppLayout title="Motor Not Found">
        <EmptyState
          title="Motor not found"
          description="The motor you're looking for doesn't exist."
          action={<Button variant="outline" onClick={() => navigate("/motors")}>Back to Motors</Button>}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title={motor.name}>
      <button
        onClick={() => navigate("/motors")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Motors
      </button>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Motor Info — 60% */}
        <Card className={cn("lg:col-span-3 border-l-4", statusBorderMap[motor.status] ?? statusBorderMap.unknown)}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 mb-3">
              <span
                className={cn(
                  "w-2.5 h-2.5 rounded-full shrink-0",
                  motor.status === "healthy" && "bg-status-healthy",
                  motor.status === "warning" && "bg-status-warning",
                  motor.status === "critical" && "bg-status-critical",
                  motor.status === "active" && "bg-primary",
                )}
              />
              <CardTitle className="text-xl">{motor.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status row */}
            <div className="flex items-center gap-3">
              <StatusBadge variant={(motor.status as StatusVariant) ?? "unknown"}>
                {motor.status.charAt(0).toUpperCase() + motor.status.slice(1)}
              </StatusBadge>
              {motor.last_inspection_date && (
                <span className="text-sm text-muted-foreground">
                  Last inspection: {motor.last_inspection_date}
                </span>
              )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Facility</p>
                  <p className="text-sm font-medium text-foreground">{motor.facility_id}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Activity className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Machine</p>
                  <p className="text-sm font-medium text-foreground">{motor.machine_id}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Box className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Model</p>
                  <p className="text-sm font-medium text-foreground">{motor.model}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Factory className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Manufacturer</p>
                  <p className="text-sm font-medium text-foreground">{motor.manufacturer}</p>
                </div>
              </div>
            </div>

            {/* Last inspection score */}
            {motor.last_inspection_score !== undefined && (
              <div className="flex items-center gap-3 bg-surface-raised rounded-md px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground">Last Inspection Score</p>
                  <p className="text-2xl font-bold text-foreground">{motor.last_inspection_score}</p>
                </div>
                {motor.last_inspection_status && (
                  <StatusBadge variant={(motor.last_inspection_status as StatusVariant) ?? "unknown"} className="ml-auto">
                    {motor.last_inspection_status.charAt(0).toUpperCase() + motor.last_inspection_status.slice(1)}
                  </StatusBadge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats — 40% */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6 space-y-4">
            {motor.last_inspection_date && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Inspection Date</p>
                  <p className="text-sm font-semibold text-foreground">{motor.last_inspection_date}</p>
                </div>
              </div>
            )}
            {motor.last_inspection_score !== undefined && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Score</p>
                  <p className="text-sm font-semibold text-foreground">{motor.last_inspection_score}</p>
                </div>
              </div>
            )}
            {motor.total_inspections !== undefined && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center">
                  <Hash className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Inspections</p>
                  <p className="text-sm font-semibold text-foreground">{motor.total_inspections}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center">
                <Factory className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Manufacturer</p>
                <p className="text-sm font-semibold text-foreground">{motor.manufacturer}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center">
                <Box className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Model</p>
                <p className="text-sm font-semibold text-foreground">{motor.model}</p>
              </div>
            </div>
            {motor.spec_id && (
              <div className="bg-surface-raised rounded-md px-4 py-3 text-sm">
                <span className="text-muted-foreground">Spec:</span>{" "}
                <span className="font-medium text-foreground">{motor.spec_id}</span>
              </div>
            )}
            {!motor.spec_id && (
              <Button variant="outline" size="sm">Assign Spec</Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      {chartData.length > 1 && (
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Inspection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis yAxisId="temp" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis yAxisId="vib" orientation="right" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      fontSize: 13,
                    }}
                  />
                  <ReferenceLine yAxisId="temp" y={95} strokeDasharray="6 3" className="stroke-status-critical" label={{ value: "Max Temp", fontSize: 10, className: "fill-status-critical" }} />
                  <ReferenceLine yAxisId="vib" y={5.0} strokeDasharray="6 3" className="stroke-status-warning" label={{ value: "Crit Vib", fontSize: 10, className: "fill-status-warning" }} />
                  <Line yAxisId="temp" type="monotone" dataKey="temperature" name="Temp (°C)" className="stroke-status-critical" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="vib" type="monotone" dataKey="vibration" name="Vibration (mm/s)" className="stroke-primary" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inspection History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Inspection History</CardTitle>
        </CardHeader>
        <CardContent>
          {inspections.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead className="text-right">Temp (°C)</TableHead>
                    <TableHead className="text-right">Vibration</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inspections.map((insp) => (
                    <TableRow key={insp.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(insp.timestamp).toLocaleString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>{insp.shift}</TableCell>
                      <TableCell className="text-right font-mono">{insp.temperature}</TableCell>
                      <TableCell className="text-right font-mono">{insp.vibration}</TableCell>
                      <TableCell className="text-sm">{insp.condition}</TableCell>
                      <TableCell>
                        <StatusBadge variant={insp.status as StatusVariant}>
                          {insp.status.charAt(0).toUpperCase() + insp.status.slice(1)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{insp.score}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                          <Brain className="w-3 h-3" />
                          Run AI
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState title="No inspections yet" description="No inspection data has been recorded for this motor." />
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
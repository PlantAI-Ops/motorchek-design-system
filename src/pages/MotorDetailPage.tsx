import { useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Hash, Activity, Thermometer, Volume2, Brain, MessageSquare } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MOCK_MOTORS, MOCK_INSPECTIONS } from "@/data/mockMotors";
import { useChat } from "@/components/chat";

const statusBorderMap: Record<string, string> = {
  healthy: "border-l-status-healthy",
  warning: "border-l-status-warning",
  critical: "border-l-status-critical",
  unknown: "border-l-muted-foreground",
};

export default function MotorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setCurrentMotor, openChat } = useChat();

  useEffect(() => {
    if (id) setCurrentMotor(id);
    return () => setCurrentMotor(null);
  }, [id, setCurrentMotor]);

  const motor = MOCK_MOTORS.find((m) => m.id === id);
  const inspections = useMemo(
    () => MOCK_INSPECTIONS.filter((i) => i.motorId === id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [id]
  );

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
        <Card className={cn("lg:col-span-3 border-l-4", statusBorderMap[motor.status])}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <StatusBadge variant={motor.status}>
                {motor.status.charAt(0).toUpperCase() + motor.status.slice(1)}
              </StatusBadge>
              <CardTitle className="text-lg">{motor.name}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 ml-auto"
                onClick={openChat}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ask AI
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <span>Facility: <span className="font-mono text-foreground">{motor.facility}</span></span>
              <span>Machine: <span className="font-mono text-foreground">{motor.machine}</span></span>
            </div>
            {motor.specName ? (
              <div className="bg-surface-raised rounded-md px-4 py-3 text-sm">
                <span className="text-muted-foreground">Spec:</span>{" "}
                <span className="font-medium text-foreground">{motor.specManufacturer} / {motor.specName}</span>
                {motor.specConfidence && (
                  <span className="ml-2 text-xs text-muted-foreground">— Confidence: {motor.specConfidence}%</span>
                )}
              </div>
            ) : (
              <Button variant="outline" size="sm">Assign Spec</Button>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats — 40% */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Inspection</p>
                <p className="text-sm font-semibold text-foreground">{motor.lastInspection ?? "None"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Score</p>
                <p className="text-sm font-semibold text-foreground">{motor.score ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center">
                <Hash className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Inspections</p>
                <p className="text-sm font-semibold text-foreground">{motor.totalInspections}</p>
              </div>
            </div>
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
            <div className="h-[280px] lg:h-[280px] h-[200px]">
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
                    <TableHead className="text-right">Noise (dB)</TableHead>
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
                      <TableCell className="text-right font-mono">{insp.noise}</TableCell>
                      <TableCell className="text-sm">{insp.condition}</TableCell>
                      <TableCell>
                        <StatusBadge variant={insp.status}>
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

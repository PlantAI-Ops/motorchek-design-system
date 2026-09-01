import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Plus } from "lucide-react";
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

const ROWS_PER_PAGE = 20;

export default function InspectionHistoryPage() {
  const { motorId } = useParams<{ motorId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const { setCurrentMotor } = useChat();

  useEffect(() => {
    if (motorId) setCurrentMotor(motorId);
    return () => setCurrentMotor(null);
  }, [motorId, setCurrentMotor]);

  const motor = MOCK_MOTORS.find((m) => m.id === motorId);
  const inspections = useMemo(
    () => MOCK_INSPECTIONS.filter((i) => i.motorId === motorId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [motorId]
  );

  const totalPages = Math.ceil(inspections.length / ROWS_PER_PAGE);
  const paginatedInspections = inspections.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

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
      <AppLayout title="Inspections">
        <EmptyState
          title="Motor not found"
          description="The motor you're looking for doesn't exist."
          action={<Button variant="outline" onClick={() => navigate("/motors")}>Back to Motors</Button>}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`Inspections — ${motor.name}`}>
      <button
        onClick={() => navigate(`/motors/${motor.id}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Motor
      </button>

      {/* Motor summary banner */}
      <Card className="mb-6">
        <CardContent className="py-4 flex flex-wrap items-center gap-4">
          <StatusBadge variant={motor.status}>
            {motor.status.charAt(0).toUpperCase() + motor.status.slice(1)}
          </StatusBadge>
          <span className="font-semibold text-foreground">{motor.name}</span>
          <span className="text-sm text-muted-foreground">Facility: <span className="font-mono">{motor.facility}</span></span>
          <span className="text-sm text-muted-foreground">Machine: <span className="font-mono">{motor.machine}</span></span>
          <div className="ml-auto">
            <Button onClick={() => navigate(`/inspections/${motor.id}/new`)} className="gap-2">
              <Plus className="w-4 h-4" />
              Log New Inspection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      {chartData.length > 1 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Inspection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] md:h-[280px] sm:h-[200px]">
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
                  <ReferenceLine yAxisId="temp" y={95} strokeDasharray="6 3" className="stroke-status-critical" />
                  <ReferenceLine yAxisId="vib" y={5.0} strokeDasharray="6 3" className="stroke-status-warning" />
                  <Line yAxisId="temp" type="monotone" dataKey="temperature" name="Temp (°C)" className="stroke-status-critical" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="vib" type="monotone" dataKey="vibration" name="Vibration (mm/s)" className="stroke-primary" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inspection History Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">All Inspections</CardTitle>
        </CardHeader>
        <CardContent>
          {inspections.length > 0 ? (
            <>
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
                    {paginatedInspections.map((insp) => (
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={() => navigate(`/analysis/${motor.id}`)}
                          >
                            <Brain className="w-3 h-3" />
                            Run AI
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No inspections recorded"
              description="No inspection data has been recorded for this motor yet."
              action={
                <Button onClick={() => navigate(`/inspections/${motor.id}/new`)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log First Inspection
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}

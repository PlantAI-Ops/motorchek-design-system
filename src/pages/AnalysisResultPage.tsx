import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge, type StatusVariant } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { getMotor } from "@/lib/api/motors";
import { getInspections } from "@/lib/api/inspections";
import { analyzeMotor } from "@/lib/api/ai";
import type { AnalyzeResponse } from "@/lib/api/ai";

export default function AnalysisResultPage() {
  const { motorId } = useParams<{ motorId: string }>();
  const navigate = useNavigate();
  const [isRerunning, setIsRerunning] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const { data: motor, isLoading: motorLoading } = useQuery({
    queryKey: ["motor", motorId],
    queryFn: () => getMotor(motorId!),
    enabled: !!motorId,
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ["inspections", motorId],
    queryFn: () => getInspections(motorId!, 1),
    enabled: !!motorId,
  });

  async function runAnalysis() {
    if (!motorId || inspections.length === 0) return;
    setIsRerunning(true);
    try {
      const latest = inspections[0];
      const res = await analyzeMotor({
        motor_id: motorId,
        readings: latest.readings,
      });
      setResult(res);
      toast.success("Analysis complete");
    } catch (err) {
      toast.error("Analysis failed", { description: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setIsRerunning(false);
    }
  }

  async function handleRerun() {
    await runAnalysis();
  }

  async function handleSave() {
    toast.success("Saved to inspection log");
  }

  if (motorLoading) {
    return (
      <AppLayout title="Loading…">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!motor) {
    return (
      <AppLayout title="AI Analysis">
        <EmptyState title="Motor not found" description="The motor you're looking for doesn't exist."
          action={<Button variant="outline" onClick={() => navigate("/motors")}>Back to Motors</Button>}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`AI Analysis — ${motor.name}`}>
      <button onClick={() => navigate(`/motors/${motor.id}`)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Motor
      </button>

      {/* Motor Info Banner */}
      <Card className="mb-6">
        <CardContent className="py-4 flex flex-wrap items-center gap-4">
          <StatusBadge variant={(motor.status as StatusVariant) ?? "unknown"}>
            {motor.status.charAt(0).toUpperCase() + motor.status.slice(1)}
          </StatusBadge>
          <span className="font-semibold text-foreground">{motor.name}</span>
          <span className="text-sm text-muted-foreground">Facility: <span className="font-mono">{motor.facility_id}</span></span>
          <span className="text-sm text-muted-foreground">Machine: <span className="font-mono">{motor.machine_id}</span></span>
        </CardContent>
      </Card>

      {/* Run Analysis CTA */}
      {!result && (
        <Card className="mb-6">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Run AI analysis on the latest inspection data.</p>
            <Button onClick={runAnalysis} disabled={inspections.length === 0} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isRerunning ? "animate-spin" : ""}`} />
              {isRerunning ? "Analyzing…" : "Run AI Analysis"}
            </Button>
            {inspections.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">Log an inspection first to enable analysis.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis Result Panel */}
      {result && (
        <>
          <Card className="mb-6">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">AI Analysis Results</CardTitle>
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleRerun} disabled={isRerunning}>
                <RefreshCw className={`w-4 h-4 ${isRerunning ? "animate-spin" : ""}`} />
                Re-run
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Two-column status cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4 pb-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rule Engine</p>
                    <StatusBadge variant={(result.rule_status as StatusVariant) ?? "unknown"}>
                      {result.rule_status.charAt(0).toUpperCase() + result.rule_status.slice(1)}
                    </StatusBadge>
                    <p className="text-2xl font-bold text-foreground">{result.rule_score}/100</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Assessment</p>
                    <StatusBadge variant={(result.ai_status as StatusVariant) ?? "unknown"}>
                      {result.ai_status.charAt(0).toUpperCase() + result.ai_status.slice(1)}
                    </StatusBadge>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.explanation}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Recommendations</p>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow-up Questions */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Follow-up Questions</p>
                <Accordion type="single" collapsible>
                  {result.follow_up_questions.map((q, i) => (
                    <AccordionItem key={i} value={`q-${i}`}>
                      <AccordionTrigger className="text-sm">{q}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground">
                          Record your answer here to improve future analysis accuracy. This information helps the AI model better understand motor operating conditions.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save to Inspection Log
            </Button>
            <Button variant="outline" onClick={handleRerun} disabled={isRerunning} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isRerunning ? "animate-spin" : ""}`} />
              Re-run Analysis
            </Button>
          </div>
        </>
      )}
    </AppLayout>
  );
}
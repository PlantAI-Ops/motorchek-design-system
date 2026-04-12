import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MOCK_MOTORS } from "@/data/mockMotors";

const MOCK_ANALYSIS = {
  ruleEngine: { status: "warning" as const, score: 65 },
  ai: {
    status: "warning" as const,
    explanation: "Motor temperature is trending upward over the last 3 inspections. Vibration levels are within acceptable range but approaching the warning threshold. The combination suggests early-stage bearing wear.",
    recommendations: [
      "Monitor temperature trend over next 48 hours",
      "Schedule bearing inspection at next maintenance window",
      "Check lubrication levels and quality",
      "Compare vibration spectrum with baseline readings",
    ],
    followUpQuestions: [
      "When was the last bearing replacement?",
      "Has there been any unusual noise in the last week?",
      "What is the current ambient temperature near the motor?",
      "Has the motor load profile changed recently?",
    ],
  },
};

export default function AnalysisResultPage() {
  const { motorId } = useParams<{ motorId: string }>();
  const navigate = useNavigate();
  const [isRerunning, setIsRerunning] = useState(false);

  const motor = MOCK_MOTORS.find((m) => m.id === motorId);

  if (!motor) {
    return (
      <AppLayout title="AI Analysis">
        <EmptyState title="Motor not found" description="The motor you're looking for doesn't exist."
          action={<Button variant="outline" onClick={() => navigate("/motors")}>Back to Motors</Button>}
        />
      </AppLayout>
    );
  }

  const handleRerun = async () => {
    setIsRerunning(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsRerunning(false);
    toast.success("Analysis re-run complete");
  };

  const handleSave = () => {
    toast.success("Saved to inspection log");
  };

  return (
    <AppLayout title={`AI Analysis — ${motor.name}`}>
      <button
        onClick={() => navigate(`/motors/${motor.id}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Motor
      </button>

      {/* Motor Info Banner */}
      <Card className="mb-6">
        <CardContent className="py-4 flex flex-wrap items-center gap-4">
          <StatusBadge variant={motor.status}>
            {motor.status.charAt(0).toUpperCase() + motor.status.slice(1)}
          </StatusBadge>
          <span className="font-semibold text-foreground">{motor.name}</span>
          <span className="text-sm text-muted-foreground">Facility: <span className="font-mono">{motor.facility}</span></span>
          <span className="text-sm text-muted-foreground">Machine: <span className="font-mono">{motor.machine}</span></span>
        </CardContent>
      </Card>

      {/* Analysis Result Panel */}
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
                <StatusBadge variant={MOCK_ANALYSIS.ruleEngine.status}>
                  {MOCK_ANALYSIS.ruleEngine.status.charAt(0).toUpperCase() + MOCK_ANALYSIS.ruleEngine.status.slice(1)}
                </StatusBadge>
                <p className="text-2xl font-bold text-foreground">{MOCK_ANALYSIS.ruleEngine.score}/100</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Assessment</p>
                <StatusBadge variant={MOCK_ANALYSIS.ai.status}>
                  {MOCK_ANALYSIS.ai.status.charAt(0).toUpperCase() + MOCK_ANALYSIS.ai.status.slice(1)}
                </StatusBadge>
                <p className="text-sm text-muted-foreground leading-relaxed">{MOCK_ANALYSIS.ai.explanation}</p>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Recommendations</p>
            <ul className="space-y-2">
              {MOCK_ANALYSIS.ai.recommendations.map((rec, i) => (
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
              {MOCK_ANALYSIS.ai.followUpQuestions.map((q, i) => (
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
    </AppLayout>
  );
}

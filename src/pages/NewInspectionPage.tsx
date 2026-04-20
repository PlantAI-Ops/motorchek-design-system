import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Info, Brain, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge, type StatusVariant } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MOCK_MOTORS } from "@/data/mockMotors";
import { MOCK_SPECS } from "@/data/mockSpecs";

const inspectionSchema = z.object({
  temperature: z.coerce.number().min(0).max(200, "Max 200°C"),
  vibration: z.coerce.number().min(0).max(10, "Max 10 mm/s"),
  noise: z.string().min(1, "Required"),
  condition: z.string().min(1, "Required"),
  observations: z.string().max(1000, "Max 1000 characters").optional(),
});

type InspectionFormValues = z.infer<typeof inspectionSchema>;

function computeRuleResult(values: InspectionFormValues, spec?: { maxTemperature: number; criticalVibration: number }) {
  let score = 100;
  let status: StatusVariant = "healthy";

  if (spec) {
    if (values.temperature > spec.maxTemperature) { score -= 40; status = "critical"; }
    else if (values.temperature > spec.maxTemperature * 0.85) { score -= 20; status = "warning"; }
    if (values.vibration > spec.criticalVibration) { score -= 30; status = "critical"; }
    else if (values.vibration > spec.criticalVibration * 0.8) { score -= 15; if (status !== "critical") status = "warning"; }
  } else {
    if (values.temperature > 90) { score -= 35; status = "critical"; }
    else if (values.temperature > 75) { score -= 15; status = "warning"; }
    if (values.vibration > 5) { score -= 25; status = "critical"; }
    else if (values.vibration > 3.5) { score -= 10; if (status !== "critical") status = "warning"; }
  }

  if (values.noise === "loud") { score -= 10; if (status === "healthy") status = "warning"; }
  if (values.condition === "corroded" || values.condition === "wet") { score -= 10; if (status === "healthy") status = "warning"; }

  return { score: Math.max(0, score), status };
}

export default function NewInspectionPage() {
  const { motorId } = useParams<{ motorId: string }>();
  const navigate = useNavigate();
  const [ruleResult, setRuleResult] = useState<{ score: number; status: StatusVariant } | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [images, setImages] = useState<{ url: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const motor = MOCK_MOTORS.find((m) => m.id === motorId);
  const spec = motor?.specName
    ? MOCK_SPECS.find((s) => `${s.manufacturer} / ${s.model}` === `${motor.specManufacturer} / ${motor.specName}`)
    : undefined;

  const form = useForm<InspectionFormValues>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: { temperature: undefined as any, vibration: undefined as any, noise: "", condition: "", observations: "" },
  });

  if (!motor) {
    return (
      <AppLayout title="Log Inspection">
        <EmptyState title="Motor not found" description="The motor you're looking for doesn't exist."
          action={<Button variant="outline" onClick={() => navigate("/motors")}>Back to Motors</Button>}
        />
      </AppLayout>
    );
  }

  const handleSubmit = (values: InspectionFormValues, analyze: boolean) => {
    const result = computeRuleResult(values, spec);
    setRuleResult(result);

    toast.success("Inspection logged successfully", {
      description: images.length > 0 ? `${images.length} image(s) attached` : undefined,
    });
    if (analyze) {
      setShowAnalysis(true);
    } else {
      setTimeout(() => navigate(`/motors/${motor.id}`), 800);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const next: { url: string; name: string }[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB`);
        return;
      }
      next.push({ url: URL.createObjectURL(file), name: file.name });
    });
    setImages((prev) => [...prev, ...next].slice(0, 6));
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  return (
    <AppLayout title={`Log Inspection — ${motor.name}`}>
      <button
        onClick={() => navigate(`/inspections/${motor.id}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Inspections
      </button>

      <div className="max-w-[560px] mx-auto space-y-6">
        {/* Spec Thresholds Info Box */}
        {spec && (
          <Card className="border-primary/30 bg-accent-subtle">
            <CardContent className="py-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="text-sm space-y-1">
                  <p className="font-medium text-foreground">Spec Reference: {spec.manufacturer} / {spec.model}</p>
                  <p className="text-muted-foreground">
                    Rated Temperature: {spec.ratedTemperature}°C · Max: {spec.maxTemperature}°C
                  </p>
                  <p className="text-muted-foreground">
                    Critical Vibration: {spec.criticalVibration} mm/s
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inspection Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inspection Readings</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => handleSubmit(v, false))} className="space-y-5">
                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature (°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="0" max="200" placeholder="e.g. 72" {...field} />
                      </FormControl>
                      {spec && <FormDescription>Rated: {spec.ratedTemperature}°C · Max: {spec.maxTemperature}°C</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vibration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vibration (mm/s)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="0" max="10" placeholder="e.g. 2.1" {...field} />
                      </FormControl>
                      {spec && <FormDescription>Critical threshold: {spec.criticalVibration} mm/s</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="noise"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Noise Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select noise level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quiet">Quiet</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="loud">Loud</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="clean">Clean</SelectItem>
                          <SelectItem value="dusty">Dusty</SelectItem>
                          <SelectItem value="wet">Wet</SelectItem>
                          <SelectItem value="corroded">Corroded</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Observations <span className="text-muted-foreground text-xs font-normal">(optional)</span></FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Unusual smells, sounds, leaks, recent maintenance, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Free-form notes that don't fit the structured fields.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Photos <span className="text-muted-foreground text-xs font-normal">(optional, up to 6)</span></FormLabel>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
                  />
                  <div
                    className="border-2 border-dashed border-border rounded-md p-4 text-center cursor-pointer hover:bg-accent-subtle transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                  >
                    <Upload className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-foreground">Click or drag images here</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB each</p>
                  </div>
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {images.map((img, i) => (
                        <div key={i} className="relative group rounded-md overflow-hidden border border-border bg-muted">
                          <img src={img.url} alt={img.name} className="w-full h-24 object-cover" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                            className="absolute top-1 right-1 bg-background/80 hover:bg-background rounded-full p-1 shadow-sm"
                            aria-label={`Remove ${img.name}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </FormItem>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={form.handleSubmit((v) => handleSubmit(v, true))}
                    className="flex-1"
                  >
                    Log Inspection & Analyze
                  </Button>
                  <Button type="submit" variant="secondary" className="flex-1">
                    Log Only
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Rule Engine Result */}
        {ruleResult && (
          <Card>
            <CardContent className="py-4 space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Rule Engine Result</p>
              <div className="flex items-center gap-4">
                <StatusBadge variant={ruleResult.status}>
                  {ruleResult.status.charAt(0).toUpperCase() + ruleResult.status.slice(1)}
                </StatusBadge>
                <span className="text-lg font-bold text-foreground">Score: {ruleResult.score}</span>
              </div>
              {!showAnalysis && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/analysis/${motor.id}`)}>
                  <Brain className="w-4 h-4" />
                  Run AI Analysis
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analysis redirect */}
        {showAnalysis && ruleResult && (
          <Card className="border-primary/30">
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">Redirecting to AI Analysis…</p>
              <Button onClick={() => navigate(`/analysis/${motor.id}`)}>
                <Brain className="w-4 h-4 mr-2" />
                View AI Analysis
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

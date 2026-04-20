import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const specSchema = z.object({
  manufacturer: z.string().trim().min(1, "Manufacturer is required").max(80),
  model: z.string().trim().min(1, "Model is required").max(80),
  ratedTemperature: z.coerce.number().min(0, "Must be ≥ 0").max(300, "Max 300°C"),
  maxTemperature: z.coerce.number().min(0).max(300, "Max 300°C"),
  criticalVibration: z.coerce.number().min(0).max(50, "Max 50 mm/s"),
  ratedPower: z.coerce.number().min(0).max(10000).optional(),
  ratedSpeed: z.coerce.number().min(0).max(100000).optional(),
  notes: z.string().max(1000).optional(),
}).refine((d) => d.maxTemperature >= d.ratedTemperature, {
  message: "Max temperature must be ≥ rated temperature",
  path: ["maxTemperature"],
});

type SpecFormValues = z.infer<typeof specSchema>;

export default function SpecCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SpecFormValues>({
    resolver: zodResolver(specSchema),
    defaultValues: {
      manufacturer: "",
      model: "",
      ratedTemperature: undefined as any,
      maxTemperature: undefined as any,
      criticalVibration: undefined as any,
      ratedPower: undefined as any,
      ratedSpeed: undefined as any,
      notes: "",
    },
  });

  async function onSubmit(values: SpecFormValues) {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSubmitting(false);
    toast.success("Spec created", {
      description: `${values.manufacturer} / ${values.model} has been added.`,
    });
    navigate("/specs");
  }

  return (
    <AppLayout title="Create Spec">
      <div className="p-6 max-w-[640px] mx-auto">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/specs")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Specs
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create Motor Spec</CardTitle>
            <CardDescription>Define operating thresholds and reference values for a motor model.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. ABB" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. M3BP 315" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="ratedTemperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rated Temp (°C)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="75" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxTemperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Temp (°C)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="90" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="criticalVibration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crit. Vib (mm/s)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="5.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ratedPower"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rated Power (kW) <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="e.g. 110" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ratedSpeed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rated Speed (RPM) <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                        <FormControl>
                          <Input type="number" step="1" placeholder="e.g. 1480" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Reference info, datasheet links, etc." {...field} />
                      </FormControl>
                      <FormDescription>Free-form notes for technicians.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating…" : "Create Spec"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/specs")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
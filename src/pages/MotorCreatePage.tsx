import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createMotor } from "@/lib/api/motors";
import { listSpecs } from "@/lib/api/specs";

const motorSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  facility_id: z.string().trim().min(1, "Facility is required").max(50, "Facility must be less than 50 characters"),
  machine_id: z.string().trim().min(1, "Machine is required").max(50, "Machine must be less than 50 characters"),
  spec_id: z.string().optional(),
});

type MotorFormValues = z.infer<typeof motorSchema>;

export default function MotorCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: specs = [], isLoading: specsLoading } = useQuery({
    queryKey: ["specs"],
    queryFn: () => listSpecs(0, 100),
  });

  const form = useForm<MotorFormValues>({
    resolver: zodResolver(motorSchema),
    defaultValues: { name: "", facility_id: "", machine_id: "", spec_id: "" },
  });

  async function onSubmit(values: MotorFormValues) {
    setIsSubmitting(true);
    try {
      const motor = await createMotor({
        name: values.name,
        facility_id: values.facility_id,
        machine_id: values.machine_id,
        spec_id: values.spec_id || undefined,
      });
      toast.success("Motor created", { description: `${motor.name} has been registered.` });
      navigate(`/motors/${motor.id}`);
    } catch (err) {
      toast.error("Failed to create motor", { description: err instanceof Error ? err.message : "Unknown error" });
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout title="Add New Motor">
      <div className="p-6 max-w-[560px] mx-auto">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/motors")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Motors
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Add New Motor</CardTitle>
            <CardDescription>Register a new motor in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Pump Motor A1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="facility_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facility</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. FAC-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="machine_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Machine</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. MCH-042" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="spec_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Linked Spec (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            {specsLoading ? <Skeleton className="h-4 w-24" /> : <SelectValue placeholder="Select a spec…" />}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {specs.map((spec) => (
                            <SelectItem key={spec.id} value={spec.id}>
                              {spec.manufacturer} / {spec.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating…" : "Create Motor"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/motors")}>
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
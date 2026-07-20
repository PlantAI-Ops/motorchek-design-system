import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { getSpec, listSpecs } from "@/lib/api/specs";
import { listMotors } from "@/lib/api/motors";
import { cn } from "@/lib/utils";
import type { StatusVariant } from "@/components/StatusBadge";

function confidenceColor(c: number) {
  if (c >= 0.80) return "text-status-healthy";
  if (c >= 0.60) return "text-status-warning";
  return "text-status-critical";
}

export default function SpecDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: spec, isLoading: specLoading } = useQuery({
    queryKey: ["spec", id],
    queryFn: () => getSpec(id!),
    enabled: !!id,
  });

  const { data: allMotors = [] } = useQuery({
    queryKey: ["motors"],
    queryFn: () => listMotors(0, 500),
  });

  const linkedMotors = allMotors.filter((m) => m.spec_id === id);

  if (specLoading) {
    return (
      <AppLayout title="Loading…">
        <div className="p-6 space-y-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!spec) {
    return (
      <AppLayout title="Spec Not Found">
        <div className="p-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/specs")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Specs
          </Button>
          <EmptyState title="Spec not found" description="The spec you're looking for doesn't exist." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`${spec.manufacturer} / ${spec.model}`}>
      <div className="p-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/specs")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Specs
        </Button>

        <h1 className="text-2xl font-bold text-foreground">
          {spec.manufacturer} / {spec.model}
        </h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spec Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Manufacturer</dt>
                <dd className="font-medium text-foreground">{spec.manufacturer}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Model</dt>
                <dd className="font-medium text-foreground">{spec.model}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Confidence</dt>
                <dd className={cn("font-semibold", confidenceColor(spec.confidence))}>{Math.round(spec.confidence * 100)}%</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Min Temperature</dt>
                <dd className="font-medium text-foreground">{spec.normalized.temperature.min}°C</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Max Temperature</dt>
                <dd className="font-medium text-foreground">{spec.normalized.temperature.max}°C</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Min Vibration</dt>
                <dd className="font-medium text-foreground">{spec.normalized.vibration.min} mm/s</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Max Vibration</dt>
                <dd className="font-medium text-foreground">{spec.normalized.vibration.max} mm/s</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">RPM</dt>
                <dd className="font-medium text-foreground">{spec.normalized.rpm}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium text-foreground">
                  {new Date(spec.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </dd>
              </div>
              {spec.raw_document_id && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Source Document</dt>
                  <dd className="font-medium text-foreground flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    {spec.raw_document_id}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Linked Motors ({linkedMotors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {linkedMotors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No motors are using this spec.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Motor Name</TableHead>
                    <TableHead>Facility</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linkedMotors.map((motor) => (
                    <TableRow
                      key={motor.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/motors/${motor.id}`)}
                    >
                      <TableCell className="font-medium">{motor.name}</TableCell>
                      <TableCell className="font-mono text-sm">{motor.facility}</TableCell>
                      <TableCell className="font-mono text-sm">{motor.machine}</TableCell>
                      <TableCell>
                        <StatusBadge variant={(motor.status as StatusVariant) ?? "unknown"}>
                          {motor.status.charAt(0).toUpperCase() + motor.status.slice(1)}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

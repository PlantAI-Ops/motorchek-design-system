import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { MOCK_SPECS } from "@/data/mockSpecs";
import { MOCK_MOTORS } from "@/data/mockMotors";
import { cn } from "@/lib/utils";

function confidenceColor(c: number) {
  if (c >= 80) return "text-status-healthy";
  if (c >= 60) return "text-status-warning";
  return "text-status-critical";
}

export default function SpecDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const spec = MOCK_SPECS.find((s) => s.id === id);

  if (!spec) {
    return (
      <AppLayout title="Spec Not Found">
        <div className="p-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/specs")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Specs
          </Button>
          <p className="mt-8 text-center text-muted-foreground">Spec not found.</p>
        </div>
      </AppLayout>
    );
  }

  const linkedMotors = MOCK_MOTORS.filter((m) => spec.linkedMotorIds.includes(m.id));

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
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
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
                <dd className={cn("font-semibold", confidenceColor(spec.confidence))}>{spec.confidence}%</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Rated Temperature</dt>
                <dd className="font-medium text-foreground">{spec.ratedTemperature}°C</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Max Temperature</dt>
                <dd className="font-medium text-foreground">{spec.maxTemperature}°C</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Critical Vibration</dt>
                <dd className="font-medium text-foreground">{spec.criticalVibration}</dd>
              </div>
              {spec.sourceDocument && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Source Document</dt>
                  <dd className="font-medium text-foreground flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    {spec.sourceDocument}
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
                      <TableCell>{motor.facility}</TableCell>
                      <TableCell>{motor.machine}</TableCell>
                      <TableCell>
                        <StatusBadge variant={motor.status}>
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

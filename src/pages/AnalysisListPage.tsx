import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Brain, Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge, type StatusVariant } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { listMotors } from "@/lib/api/motors";
import { useDebounce } from "@/hooks/useDebounce";

export default function AnalysisListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  const { data: motors = [], isLoading } = useQuery({
    queryKey: ["motors"],
    queryFn: () => listMotors(0, 100),
  });

  const filtered = motors.filter((m) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.facility_id.toLowerCase().includes(q) || m.machine_id.toLowerCase().includes(q);
  });

  return (
    <AppLayout title="AI Analysis">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search motors…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No motors found" description="Try adjusting your search query." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Motor</TableHead>
                    <TableHead>Facility</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((motor) => (
                    <TableRow key={motor.id}>
                      <TableCell className="font-medium">{motor.name}</TableCell>
                      <TableCell className="font-mono text-sm">{motor.facility_id}</TableCell>
                      <TableCell className="font-mono text-sm">{motor.machine_id}</TableCell>
                      <TableCell>
                        <StatusBadge variant={(motor.status as StatusVariant) ?? "unknown"}>
                          {motor.status.charAt(0).toUpperCase() + motor.status.slice(1)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" className="gap-2" onClick={() => navigate(`/analysis/${motor.id}`)}>
                          <Brain className="w-4 h-4" />
                          Run Analysis
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
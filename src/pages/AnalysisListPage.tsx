import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_MOTORS } from "@/data/mockMotors";
import { useDebounce } from "@/hooks/useDebounce";

export default function AnalysisListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  const motors = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return MOCK_MOTORS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.facility.toLowerCase().includes(q) ||
        m.machine.toLowerCase().includes(q)
    );
  }, [debouncedSearch]);

  return (
    <AppLayout title="AI Analysis">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search motors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {motors.length === 0 ? (
        <EmptyState
          title="No motors found"
          description="Try adjusting your search query."
        />
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
                  {motors.map((motor) => (
                    <TableRow key={motor.id}>
                      <TableCell className="font-medium">{motor.name}</TableCell>
                      <TableCell className="font-mono text-sm">{motor.facility}</TableCell>
                      <TableCell className="font-mono text-sm">{motor.machine}</TableCell>
                      <TableCell>
                        <StatusBadge variant={motor.status}>
                          {motor.status.charAt(0).toUpperCase() + motor.status.slice(1)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => navigate(`/analysis/${motor.id}`)}
                        >
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

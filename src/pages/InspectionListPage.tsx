import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge, type StatusVariant } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";
import { MOCK_INSPECTIONS, MOCK_MOTORS } from "@/data/mockMotors";
import { Search, ClipboardList } from "lucide-react";

export default function InspectionListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [motorFilter, setMotorFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(search, 250);

  const motorsMap = useMemo(() => {
    const map: Record<string, typeof MOCK_MOTORS[0]> = {};
    MOCK_MOTORS.forEach((m) => { map[m.id] = m; });
    return map;
  }, []);

  const filtered = useMemo(() => {
    return MOCK_INSPECTIONS.filter((insp) => {
      const motor = motorsMap[insp.motorId];
      if (statusFilter !== "all" && insp.status !== statusFilter) return false;
      if (motorFilter !== "all" && insp.motorId !== motorFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const motorName = motor?.name.toLowerCase() ?? "";
        const condition = insp.condition.toLowerCase();
        if (!motorName.includes(q) && !condition.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [debouncedSearch, statusFilter, motorFilter, motorsMap]);

  return (
    <AppLayout title="Inspections">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by motor or condition…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={motorFilter} onValueChange={setMotorFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Motors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Motors</SelectItem>
            {MOCK_MOTORS.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No inspections found"
          description="Adjust your filters or log a new inspection from a motor's detail page."
        />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-raised">
                  <TableHead>Motor</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead className="text-right">Temp °C</TableHead>
                  <TableHead className="text-right">Vibration</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((insp) => {
                  const motor = motorsMap[insp.motorId];
                  return (
                    <TableRow
                      key={insp.id}
                      className="cursor-pointer hover:bg-accent-subtle"
                      onClick={() => navigate(`/inspections/${insp.motorId}`)}
                    >
                      <TableCell className="font-medium text-foreground">{motor?.name ?? insp.motorId}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {new Date(insp.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{insp.shift}</TableCell>
                      <TableCell className="text-right">{insp.temperature}</TableCell>
                      <TableCell className="text-right">{insp.vibration}</TableCell>
                      <TableCell className="text-muted-foreground">{insp.condition}</TableCell>
                      <TableCell className="text-center">
                        <StatusBadge variant={insp.status}>
                          {insp.status.charAt(0).toUpperCase() + insp.status.slice(1)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{insp.score}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {filtered.map((insp) => {
              const motor = motorsMap[insp.motorId];
              return (
                <div
                  key={insp.id}
                  className="bg-card rounded-lg border border-border p-4 space-y-2 cursor-pointer hover:bg-accent-subtle transition-colors"
                  onClick={() => navigate(`/inspections/${insp.motorId}`)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{motor?.name ?? insp.motorId}</span>
                    <StatusBadge variant={insp.status}>
                      {insp.status.charAt(0).toUpperCase() + insp.status.slice(1)}
                    </StatusBadge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">
                    {new Date(insp.timestamp).toLocaleString()} · {insp.shift}
                  </p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Temp: {insp.temperature}°C</span>
                    <span>Vib: {insp.vibration}</span>
                    <span className="ml-auto font-semibold text-foreground">Score: {insp.score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </AppLayout>
  );
}

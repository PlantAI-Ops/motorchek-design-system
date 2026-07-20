import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, ClipboardList } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge, type StatusVariant } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { listInspections } from "@/lib/api/inspections";
import { useDebounce } from "@/hooks/useDebounce";

export default function InspectionListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(search, 250);

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ["inspections"],
    queryFn: () => listInspections(0, 100),
  });

  const filtered = inspections.filter((i) => {
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      return i.motor.toLowerCase().includes(q);
    }
    return true;
  });

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(",", "");
  };

  return (
    <AppLayout title="Inspections">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by motor…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
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
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList className="w-5 h-5" />} title="No inspections found" description="Adjust your filters or create a new inspection." />
      ) : (
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
              {filtered.map((inspection) => (
                <TableRow key={inspection.id} className="cursor-pointer hover:bg-accent-subtle"
                  onClick={() => navigate(`/inspections/${inspection.motor_id}`)}>
                  <TableCell className="font-medium text-foreground">{inspection.motor}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{formatTimestamp(inspection.timestamp)}</TableCell>
                  <TableCell className="text-capitalize text-muted-foreground">{inspection.shift}</TableCell>
                  <TableCell className="text-right text-foreground">{inspection.temperature_c}</TableCell>
                  <TableCell className="text-right text-foreground">{inspection.vibration}</TableCell>
                  <TableCell className="text-capitalize text-muted-foreground">{inspection.condition}</TableCell>
                  <TableCell className="text-center">
                    <StatusBadge variant={(inspection.status as StatusVariant) ?? "unknown"}>
                      {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-foreground">{inspection.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AppLayout>
  );
}
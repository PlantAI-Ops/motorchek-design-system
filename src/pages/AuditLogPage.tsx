import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MOCK_AUDIT_LOGS, type AuditAction, type AuditResource } from "@/data/mockAuditLogs";

const ACTION_COLORS: Record<AuditAction, string> = {
  CREATE: "bg-status-healthy/15 text-status-healthy border-status-healthy/30",
  UPDATE: "bg-primary/15 text-primary border-primary/30",
  DELETE: "bg-status-critical/15 text-status-critical border-status-critical/30",
  UPLOAD: "bg-status-warning/15 text-status-warning border-status-warning/30",
  PARSE: "bg-accent text-accent-foreground border-border",
  ASSIGN: "bg-primary/15 text-primary border-primary/30",
};

const RESOURCE_TYPES: AuditResource[] = ["motor", "spec", "document", "inspection", "user"];
const USERS = [...new Map(MOCK_AUDIT_LOGS.map((l) => [l.userId, { id: l.userId, name: l.userName }])).values()];

export default function AuditLogPage() {
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter((log) => {
      if (resourceFilter !== "all" && log.resource !== resourceFilter) return false;
      if (userFilter !== "all" && log.userId !== userFilter) return false;
      const ts = new Date(log.timestamp);
      if (dateFrom && ts < dateFrom) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (ts > end) return false;
      }
      return true;
    });
  }, [resourceFilter, userFilter, dateFrom, dateTo]);

  return (
    <AppLayout title="Audit Logs">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Resource Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            {RESOURCE_TYPES.map((r) => (
              <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="User" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {USERS.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[150px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "MMM d") : "From"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[150px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "MMM d") : "To"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>

        {(resourceFilter !== "all" || userFilter !== "all" || dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" onClick={() => { setResourceFilter("all"); setUserFilter("all"); setDateFrom(undefined); setDateTo(undefined); }}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState title="No audit logs" description="No audit logs match your filters." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead className="text-right">Diff</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((log) => (
                    <>
                      <TableRow key={log.id} className="cursor-pointer" onClick={() => log.diff && setExpandedId(expandedId === log.id ? null : log.id)}>
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs font-semibold", ACTION_COLORS[log.action])}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.userName}</TableCell>
                        <TableCell className="capitalize text-sm">{log.resource}</TableCell>
                        <TableCell className="font-mono text-xs">{log.resourceId}</TableCell>
                        <TableCell className="text-right">
                          {log.diff && (
                            <Button variant="ghost" size="sm" className="text-xs">
                              {expandedId === log.id ? "▲" : "▼"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedId === log.id && log.diff && (
                        <TableRow key={`${log.id}-diff`}>
                          <TableCell colSpan={6} className="bg-muted/50 p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-status-critical mb-1">Before</p>
                                <pre className="text-xs font-mono bg-background rounded-md p-3 border border-border overflow-auto text-status-critical/80">
                                  {JSON.stringify(log.diff.before, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-status-healthy mb-1">After</p>
                                <pre className="text-xs font-mono bg-background rounded-md p-3 border border-border overflow-auto text-status-healthy/80">
                                  {JSON.stringify(log.diff.after, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
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

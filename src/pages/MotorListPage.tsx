import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Filter } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { MotorCard } from "@/components/MotorCard";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/AuthProvider";
import { listMotors } from "@/lib/api/motors";
import type { StatusVariant } from "@/components/StatusBadge";
import { useDebounce } from "@/hooks/useDebounce";

export default function MotorListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const debouncedSearch = useDebounce(searchInput, 300);
  const statusFilter = (searchParams.get("status") ?? "all") as StatusVariant | "all";

  const { data: motors = [], isLoading } = useQuery({
    queryKey: ["motors"],
    queryFn: () => listMotors(0, 100),
  });

  const setStatusFilter = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") params.delete("status");
    else params.set("status", value);
    setSearchParams(params, { replace: true });
  };

  const filteredMotors = (() => {
    let result = motors;
    if (statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.facility.toLowerCase().includes(q) ||
          m.machine.toLowerCase().includes(q)
      );
    }
    return result;
  })();

  return (
    <AppLayout title="Motors">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search motors, facilities, machines…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        {user?.role === "admin" && (
          <Button onClick={() => navigate("/motors/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Motor
          </Button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card">
              <div className="p-5 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMotors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMotors.map((motor) => (
            <MotorCard
              key={motor.id}
              name={motor.name}
              facility={motor.facility}
              machine={motor.machine}
              model={motor.model}
              manufacturer={motor.manufacturer}
              status={(motor.status as StatusVariant) ?? "unknown"}
              lastInspectionDate={motor.last_inspection_date}
              lastInspectionScore={motor.last_inspection_score}
              lastInspectionStatus={(motor.last_inspection_status as StatusVariant) ?? undefined}
              onClick={() => navigate(`/motors/${motor.id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No motors found"
          description="Try adjusting your search or filter criteria."
          action={
            user?.role === "admin" ? (
              <Button onClick={() => navigate("/motors/new")} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Motor
              </Button>
            ) : undefined
          }
        />
      )}
    </AppLayout>
  );
}
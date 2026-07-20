import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SpecCard } from "@/components/SpecCard";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/AuthProvider";
import { useDebounce } from "@/hooks/useDebounce";
import { listSpecs } from "@/lib/api/specs";

export default function SpecListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [manufacturerSearch, setManufacturerSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const debouncedManufacturer = useDebounce(manufacturerSearch, 300);
  const debouncedModel = useDebounce(modelSearch, 300);

  const canCreate = user?.role === "admin" || user?.role === "supervisor";

  const { data: specs = [], isLoading } = useQuery({
    queryKey: ["specs", debouncedManufacturer, debouncedModel],
    queryFn: () => listSpecs(debouncedManufacturer || undefined, debouncedModel || undefined, 100),
  });

  return (
    <AppLayout title="Specs">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Specs</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filter by manufacturer…"
              value={manufacturerSearch}
              onChange={(e) => setManufacturerSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filter by model…"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {canCreate && (
            <Button onClick={() => navigate("/specs/new")}>
              <Plus className="w-4 h-4 mr-1" /> Create Spec
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
        ) : specs.length === 0 ? (
          <EmptyState title="No specs found" description="Try adjusting your search filters." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specs.map((spec) => (
              <SpecCard
                key={spec.id}
                id={spec.id}
                manufacturer={spec.manufacturer}
                model={spec.model}
                confidence={spec.confidence}
                normalized={spec.normalized}
                createdAt={spec.created_at}
                onClick={() => navigate(`/specs/${spec.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

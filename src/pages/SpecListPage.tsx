import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SpecCard } from "@/components/SpecCard";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/components/AuthProvider";
import { useDebounce } from "@/hooks/useDebounce";
import { MOCK_SPECS } from "@/data/mockSpecs";

export default function SpecListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [manufacturerSearch, setManufacturerSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const debouncedManufacturer = useDebounce(manufacturerSearch, 300);
  const debouncedModel = useDebounce(modelSearch, 300);

  const canCreate = user?.role === "admin" || user?.role === "supervisor";

  const filtered = useMemo(() => {
    return MOCK_SPECS.filter((spec) => {
      const matchMfg = !debouncedManufacturer || spec.manufacturer.toLowerCase().includes(debouncedManufacturer.toLowerCase());
      const matchModel = !debouncedModel || spec.model.toLowerCase().includes(debouncedModel.toLowerCase());
      return matchMfg && matchModel;
    });
  }, [debouncedManufacturer, debouncedModel]);

  return (
    <AppLayout>
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

        {filtered.length === 0 ? (
          <EmptyState title="No specs found" description="Try adjusting your search filters." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((spec) => (
              <SpecCard
                key={spec.id}
                manufacturer={spec.manufacturer}
                model={spec.model}
                confidence={spec.confidence}
                linkedMotorCount={spec.linkedMotorIds.length}
                createdAt={spec.createdAt}
                onClick={() => navigate(`/specs/${spec.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

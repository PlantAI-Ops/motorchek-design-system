import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Upload, Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { MOCK_DOCUMENTS } from "@/data/mockDocuments";
import { useAuth } from "@/components/AuthProvider";

export default function DocumentListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [manufacturer, setManufacturer] = useState("all");
  const debouncedSearch = useDebounce(search, 300);

  const canUpload = user?.role === "admin" || user?.role === "supervisor";

  const manufacturers = useMemo(
    () => [...new Set(MOCK_DOCUMENTS.map((d) => d.manufacturer))].sort(),
    []
  );

  const filtered = useMemo(() => {
    return MOCK_DOCUMENTS.filter((d) => {
      const matchesSearch = d.filename.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesMfr = manufacturer === "all" || d.manufacturer === manufacturer;
      return matchesSearch && matchesMfr;
    });
  }, [debouncedSearch, manufacturer]);

  return (
    <AppLayout title="Documents">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by filename…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={manufacturer} onValueChange={setManufacturer}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Manufacturer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Manufacturers</SelectItem>
            {manufacturers.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canUpload && (
          <Button onClick={() => navigate("/documents/upload")} className="gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </Button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-5 pb-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.manufacturer} · {doc.model}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Uploaded: {doc.uploadedAt}</span>
                  <span>{doc.size}</span>
                </div>
                <div className="flex gap-2">
                  {doc.isProcessed && (
                    <StatusBadge variant="healthy">Processed</StatusBadge>
                  )}
                  {doc.isDuplicate && (
                    <StatusBadge variant="warning">Duplicate</StatusBadge>
                  )}
                  {!doc.isProcessed && !doc.isDuplicate && (
                    <StatusBadge variant="unknown">Pending</StatusBadge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No documents found"
          description="No documents match your search criteria."
          action={canUpload ? (
            <Button onClick={() => navigate("/documents/upload")} className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Document
            </Button>
          ) : undefined}
        />
      )}
    </AppLayout>
  );
}

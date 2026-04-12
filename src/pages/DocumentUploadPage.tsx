import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_DOCUMENTS } from "@/data/mockDocuments";

export default function DocumentUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast.error("Please select a PDF file");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast.error("Please drop a PDF file");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsUploading(false);
    setUploaded(true);
    toast.success("Document uploaded successfully");
  };

  const handleParseSpec = async () => {
    toast.info("Spec extraction started…");
    await new Promise((r) => setTimeout(r, 1500));
    toast.success("Spec extracted with 89% confidence");
  };

  const recentDocs = MOCK_DOCUMENTS.slice(0, 10);

  return (
    <AppLayout title="Upload Document">
      <button
        onClick={() => navigate("/documents")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Documents
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — Upload Dropzone (40%) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dropzone */}
          <Card>
            <CardContent className="pt-6">
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground mb-1">
                  {selectedFile ? selectedFile.name : "Drag PDF here or click to browse"}
                </p>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Upload Form */}
          {selectedFile && !uploaded && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="manufacturer">Manufacturer (optional)</Label>
                  <Input id="manufacturer" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder="e.g. ABB" />
                </div>
                <div>
                  <Label htmlFor="model">Model (optional)</Label>
                  <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. M3BP 315" />
                </div>
                <Button onClick={handleUpload} disabled={isUploading} className="w-full gap-2">
                  {isUploading ? "Uploading…" : "Upload"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Post-upload actions */}
          {uploaded && (
            <Card className="border-status-healthy/30">
              <CardContent className="pt-6 space-y-3 text-center">
                <CheckCircle className="w-10 h-10 mx-auto text-status-healthy" />
                <p className="text-sm font-semibold text-foreground">Upload complete</p>
                <Button variant="outline" onClick={handleParseSpec} className="gap-2">
                  Parse Spec
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — Previous Uploads (60%) */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-surface-raised transition-colors">
                  <div className="w-8 h-8 rounded bg-accent-subtle flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground">{doc.manufacturer} · {doc.uploadedAt}</p>
                  </div>
                  <div className="flex gap-1">
                    {doc.isProcessed && <StatusBadge variant="healthy">Processed</StatusBadge>}
                    {doc.isDuplicate && <StatusBadge variant="warning">Duplicate</StatusBadge>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

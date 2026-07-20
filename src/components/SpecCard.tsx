import { cn } from "@/lib/utils";
import { Cpu } from "lucide-react";

interface SpecCardProps {
  id: string;
  manufacturer: string;
  model: string;
  confidence: number;
  normalized: {
    temperature: { min: number; max: number };
    vibration: { min: number; max: number };
    rpm: number;
  };
  createdAt: string;
  onClick?: () => void;
}

function confidenceColor(confidence: number) {
  if (confidence >= 80) return "text-status-healthy";
  if (confidence >= 60) return "text-status-warning";
  return "text-status-critical";
}

export function SpecCard({ id, manufacturer, model, confidence, normalized, createdAt, onClick }: SpecCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-lg border border-border shadow-sm p-6 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Cpu className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-md font-semibold text-foreground">
          {manufacturer} / {model}
        </h3>
      </div>

      <div className="space-y-1 text-sm text-muted-foreground">
        <p>
          Confidence: <span className={cn("font-semibold", confidenceColor(Math.round(confidence * 100)))}>{Math.round(confidence * 100)}%</span>
        </p>
        <p>Temp: {normalized.temperature.min}–{normalized.temperature.max}°C</p>
        <p>Vib: {normalized.vibration.min}–{normalized.vibration.max} mm/s</p>
        <p>RPM: {normalized.rpm}</p>
        <p>Created: {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
      </div>
    </div>
  );
}

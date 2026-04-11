export interface Spec {
  id: string;
  manufacturer: string;
  model: string;
  confidence: number;
  ratedTemperature: number;
  maxTemperature: number;
  criticalVibration: number;
  sourceDocument?: string;
  linkedMotorIds: string[];
  createdAt: string;
}

export const MOCK_SPECS: Spec[] = [
  { id: "s1", manufacturer: "ABB", model: "M3BP 315", confidence: 92, ratedTemperature: 75, maxTemperature: 90, criticalVibration: 5.0, sourceDocument: "abb-m3bp-315-datasheet.pdf", linkedMotorIds: ["m1"], createdAt: "2026-03-15" },
  { id: "s2", manufacturer: "Siemens", model: "1LE1", confidence: 87, ratedTemperature: 80, maxTemperature: 95, criticalVibration: 4.5, sourceDocument: "siemens-1le1-spec.pdf", linkedMotorIds: ["m2", "m9"], createdAt: "2026-03-10" },
  { id: "s3", manufacturer: "WEG", model: "W22", confidence: 95, ratedTemperature: 70, maxTemperature: 85, criticalVibration: 4.0, sourceDocument: "weg-w22-manual.pdf", linkedMotorIds: ["m4"], createdAt: "2026-02-28" },
  { id: "s4", manufacturer: "Nidec", model: "U-GMX", confidence: 78, ratedTemperature: 72, maxTemperature: 88, criticalVibration: 5.5, linkedMotorIds: ["m5"], createdAt: "2026-03-20" },
  { id: "s5", manufacturer: "ABB", model: "M3BP 250", confidence: 90, ratedTemperature: 78, maxTemperature: 92, criticalVibration: 4.8, sourceDocument: "abb-m3bp-250-datasheet.pdf", linkedMotorIds: ["m8"], createdAt: "2026-01-15" },
];

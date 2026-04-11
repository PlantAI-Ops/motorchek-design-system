import type { StatusVariant } from "@/components/StatusBadge";

export interface Motor {
  id: string;
  name: string;
  facility: string;
  machine: string;
  status: StatusVariant;
  specName?: string;
  specManufacturer?: string;
  specConfidence?: number;
  lastInspection?: string;
  score?: number;
  totalInspections: number;
}

export interface Inspection {
  id: string;
  motorId: string;
  timestamp: string;
  shift: "Day" | "Night" | "Swing";
  temperature: number;
  vibration: number;
  noise: number;
  condition: string;
  status: StatusVariant;
  score: number;
  analysisResult?: string;
}

export const MOCK_MOTORS: Motor[] = [
  { id: "m1", name: "Pump Motor A1", facility: "FAC-001", machine: "MCH-042", status: "healthy", specName: "ABB M3BP 315", specManufacturer: "ABB", specConfidence: 92, lastInspection: "10 Apr 2026", score: 88, totalInspections: 47 },
  { id: "m2", name: "Conveyor Drive B3", facility: "FAC-001", machine: "MCH-019", status: "warning", specName: "Siemens 1LE1", specManufacturer: "Siemens", specConfidence: 87, lastInspection: "09 Apr 2026", score: 62, totalInspections: 31 },
  { id: "m3", name: "Compressor Motor C2", facility: "FAC-002", machine: "MCH-105", status: "critical", lastInspection: "08 Apr 2026", score: 34, totalInspections: 22 },
  { id: "m4", name: "Fan Motor D1", facility: "FAC-002", machine: "MCH-088", status: "healthy", specName: "WEG W22", specManufacturer: "WEG", specConfidence: 95, lastInspection: "10 Apr 2026", score: 91, totalInspections: 55 },
  { id: "m5", name: "Mixer Motor E4", facility: "FAC-003", machine: "MCH-201", status: "warning", specName: "Nidec U-GMX", specManufacturer: "Nidec", specConfidence: 78, lastInspection: "07 Apr 2026", score: 58, totalInspections: 18 },
  { id: "m6", name: "Centrifuge Motor F2", facility: "FAC-003", machine: "MCH-177", status: "healthy", lastInspection: "10 Apr 2026", score: 85, totalInspections: 39 },
  { id: "m7", name: "Press Motor G1", facility: "FAC-001", machine: "MCH-063", status: "unknown", totalInspections: 0 },
  { id: "m8", name: "Extruder Motor H5", facility: "FAC-004", machine: "MCH-312", status: "critical", specName: "ABB M3BP 250", specManufacturer: "ABB", specConfidence: 90, lastInspection: "06 Apr 2026", score: 28, totalInspections: 41 },
  { id: "m9", name: "Blower Motor J3", facility: "FAC-004", machine: "MCH-290", status: "healthy", specName: "Siemens 1LE1", specManufacturer: "Siemens", specConfidence: 88, lastInspection: "10 Apr 2026", score: 94, totalInspections: 63 },
];

export const MOCK_INSPECTIONS: Inspection[] = [
  { id: "i1", motorId: "m1", timestamp: "2026-04-10T09:14:00Z", shift: "Day", temperature: 72, vibration: 2.1, noise: 68, condition: "Normal", status: "healthy", score: 88 },
  { id: "i2", motorId: "m1", timestamp: "2026-04-08T14:30:00Z", shift: "Day", temperature: 74, vibration: 2.3, noise: 70, condition: "Normal", status: "healthy", score: 85 },
  { id: "i3", motorId: "m1", timestamp: "2026-04-05T22:10:00Z", shift: "Night", temperature: 71, vibration: 2.0, noise: 67, condition: "Normal", status: "healthy", score: 90 },
  { id: "i4", motorId: "m1", timestamp: "2026-04-02T07:45:00Z", shift: "Day", temperature: 78, vibration: 3.1, noise: 72, condition: "Elevated temp", status: "warning", score: 68 },
  { id: "i5", motorId: "m1", timestamp: "2026-03-30T16:20:00Z", shift: "Swing", temperature: 70, vibration: 2.0, noise: 66, condition: "Normal", status: "healthy", score: 91 },
  { id: "i6", motorId: "m2", timestamp: "2026-04-09T11:00:00Z", shift: "Day", temperature: 82, vibration: 4.2, noise: 78, condition: "High vibration", status: "warning", score: 62 },
  { id: "i7", motorId: "m2", timestamp: "2026-04-06T08:15:00Z", shift: "Day", temperature: 80, vibration: 3.8, noise: 76, condition: "Elevated", status: "warning", score: 65 },
  { id: "i8", motorId: "m3", timestamp: "2026-04-08T13:45:00Z", shift: "Day", temperature: 98, vibration: 6.5, noise: 89, condition: "Critical overheating", status: "critical", score: 34 },
  { id: "i9", motorId: "m3", timestamp: "2026-04-04T19:30:00Z", shift: "Night", temperature: 92, vibration: 5.8, noise: 85, condition: "High temp + vibration", status: "critical", score: 40 },
  { id: "i10", motorId: "m8", timestamp: "2026-04-06T10:00:00Z", shift: "Day", temperature: 101, vibration: 7.2, noise: 91, condition: "Bearing failure risk", status: "critical", score: 28 },
];

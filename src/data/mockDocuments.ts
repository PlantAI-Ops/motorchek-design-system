export interface Document {
  id: string;
  filename: string;
  manufacturer: string;
  model: string;
  uploadedAt: string;
  size: string;
  isProcessed: boolean;
  isDuplicate: boolean;
  specId?: string;
}

export const MOCK_DOCUMENTS: Document[] = [
  { id: "d1", filename: "abb-m3bp-315-datasheet.pdf", manufacturer: "ABB", model: "M3BP 315", uploadedAt: "2026-03-15", size: "2.4 MB", isProcessed: true, isDuplicate: false, specId: "s1" },
  { id: "d2", filename: "siemens-1le1-spec.pdf", manufacturer: "Siemens", model: "1LE1", uploadedAt: "2026-03-10", size: "3.1 MB", isProcessed: true, isDuplicate: false, specId: "s2" },
  { id: "d3", filename: "weg-w22-manual.pdf", manufacturer: "WEG", model: "W22", uploadedAt: "2026-02-28", size: "5.8 MB", isProcessed: true, isDuplicate: false, specId: "s3" },
  { id: "d4", filename: "abb-m3bp-250-datasheet.pdf", manufacturer: "ABB", model: "M3BP 250", uploadedAt: "2026-01-15", size: "2.1 MB", isProcessed: true, isDuplicate: false, specId: "s5" },
  { id: "d5", filename: "nidec-u-gmx-specs.pdf", manufacturer: "Nidec", model: "U-GMX", uploadedAt: "2026-03-20", size: "1.9 MB", isProcessed: true, isDuplicate: false, specId: "s4" },
  { id: "d6", filename: "abb-m3bp-315-v2.pdf", manufacturer: "ABB", model: "M3BP 315", uploadedAt: "2026-04-01", size: "2.5 MB", isProcessed: false, isDuplicate: true },
  { id: "d7", filename: "siemens-1le1-maintenance.pdf", manufacturer: "Siemens", model: "1LE1", uploadedAt: "2026-04-05", size: "4.2 MB", isProcessed: false, isDuplicate: false },
];

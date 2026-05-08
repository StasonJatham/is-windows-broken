export interface VersionStatus {
  version: string;
  status: 'GREEN' | 'YELLOW' | 'RED';
  should_block_patch: boolean;
  summary: string;
  data_date: string;
}

export interface OverallStatus {
  status: 'GREEN' | 'YELLOW' | 'RED';
  should_block_patch: boolean;
  summary: string;
  confidence: number;
}

export interface PatchMetadata {
  berlinDate: string;
  patchTuesday: string;
  patchDay: string;
  activeWindow: boolean;
}

export interface AnalysisItem {
  generatedAt: string;
  patch: PatchMetadata | null;
  overall: OverallStatus;
  versions: VersionStatus[];
}

export interface ApiResponse {
  ok: boolean;
  count: number;
  items: AnalysisItem[];
}

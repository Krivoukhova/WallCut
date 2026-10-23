export type ExportFormat = 'mp4' | 'webm';

export type ExportAudioAsset = {
  id: string;
  fileName?: string;
  mimeType?: string;
  state: unknown;
  dataBase64: string;
};

export type ExportBundle = {
  formatVersion: 1;
  exportedAt: string;
  projectName: string;
  width: number;
  height: number;
  fps: number;
  timeline: unknown;
  visualTimeline: unknown;
  background?: unknown;
  project?: unknown;
  audioTracks: Array<{ id: string; fileName?: string; mimeType?: string; state: unknown }>;
  audioAssets: ExportAudioAsset[];
};

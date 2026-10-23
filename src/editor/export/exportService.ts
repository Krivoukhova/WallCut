import type { ExportAudioAsset, ExportBundle, ExportFormat } from './exportTypes';

export type { ExportAudioAsset, ExportBundle, ExportFormat } from './exportTypes';

/** Convert renderer failures into the editor's localized export error message. */
export function formatExportError(code: string, localizedMessage: string): string {
  return code === 'EXPORT_INVALID_VISUAL_TIMELINE' || code === 'EXPORT_INVALID_AUDIO_TRACK'
    ? localizedMessage
    : `${localizedMessage} (${code})`;
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length)),
    );
  }
  return btoa(binary);
}

/** Media formats are rendered locally by Remotion Web Renderer. */
export async function requestMediaExport(
  bundle: ExportBundle,
  format: ExportFormat,
): Promise<void> {
  const { exportMediaInBrowser } = await import('./browserMediaExport');
  await exportMediaInBrowser(bundle, format);
}

export function createExportBundle(input: {
  projectName?: string;
  fps: number;
  timeline: unknown;
  visualTimeline: unknown;
  background?: unknown;
  project?: unknown;
  audioTracks: Array<{
    id: string;
    binary?: ArrayBuffer;
    fileName?: string;
    mimeType?: string;
    state: unknown;
  }>;
}): ExportBundle {
  const assets: ExportAudioAsset[] = input.audioTracks
    .filter(
      (track): track is typeof track & { binary: ArrayBuffer } =>
        track.binary instanceof ArrayBuffer,
    )
    .map((track) => ({
      id: track.id,
      fileName: track.fileName,
      mimeType: track.mimeType,
      state: track.state,
      dataBase64: toBase64(track.binary),
    }));

  return {
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    projectName: input.projectName?.trim() || 'WallCut Project',
    width: 1080,
    height: 1920,
    fps: input.fps,
    timeline: input.timeline,
    visualTimeline: input.visualTimeline,
    background: input.background,
    project: input.project,
    audioTracks: input.audioTracks.map(({ id, fileName, mimeType, state }) => ({
      id,
      fileName,
      mimeType,
      state,
    })),
    audioAssets: assets,
  };
}

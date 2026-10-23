import React from 'react';
import { renderMediaOnWeb } from '@remotion/web-renderer';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import type { BackgroundStyle } from '../../domain/background/backgroundTypes';
import type { TTSTimeline } from '../../domain/timeline/ttsTimelineTypes';
import {
  compileRenderModel,
  type RenderAudioTrack,
  type RenderModel,
} from '../../renderer/renderModel';
import { PlayerComposition } from '../PlayerComposition';
import type { ExportBundle, ExportFormat } from './exportTypes';

function safeFileName(value: string): string {
  const cleaned = value
    .trim()
    .split('')
    .map((character) => {
      const code = character.charCodeAt(0);
      return '<>:"/\\|?*'.includes(character) || code < 32 ? '-' : character;
    })
    .join('')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return cleaned || 'wallcut-project';
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function base64ToBlobUrl(dataBase64: string, mimeType = 'audio/mpeg'): string {
  const binary = atob(dataBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
}

function getDurationFrames(bundle: ExportBundle, visualDuration: number): number {
  const timeline = bundle.timeline as Partial<TTSTimeline> | undefined;
  const timelineFrames = Number(timeline?.totalFrames);
  return Math.max(1, visualDuration, Number.isFinite(timelineFrames) ? timelineFrames : 0);
}

/** Render MP4/WebM locally in the browser using Remotion Web Renderer. No API/server is used. */
export async function exportMediaInBrowser(
  bundle: ExportBundle,
  format: Extract<ExportFormat, 'mp4' | 'webm'>,
): Promise<void> {
  const fps = Math.max(1, Math.round(Number(bundle.fps) || 30));
  const visualTimeline = bundle.visualTimeline as VisualTimelineData;
  if (!visualTimeline || !Array.isArray(visualTimeline.segments)) {
    throw new Error('EXPORT_INVALID_VISUAL_TIMELINE');
  }

  const objectUrls: string[] = [];
  try {
    const assetById = new Map(bundle.audioAssets.map((asset) => [asset.id, asset]));
    const audioTracks: RenderAudioTrack[] = [];

    for (const track of bundle.audioTracks) {
      const asset = assetById.get(track.id);
      if (!asset) continue;
      const publicPath = base64ToBlobUrl(
        asset.dataBase64,
        asset.mimeType || track.mimeType || 'audio/mpeg',
      );
      objectUrls.push(publicPath);
      const state = track.state as RenderAudioTrack['state'];
      if (!state || !Number.isFinite(state.startFrame) || !Number.isFinite(state.durationFrames)) {
        throw new Error('EXPORT_INVALID_AUDIO_TRACK');
      }
      audioTracks.push({ id: track.id, publicPath, state });
    }

    const renderModel = compileRenderModel(
      visualTimeline,
      fps,
      audioTracks,
      bundle.background as BackgroundStyle | null | undefined,
    );
    const durationInFrames = getDurationFrames(bundle, renderModel.durationInFrames);
    const component = PlayerComposition as React.FC<{
      renderModel: RenderModel;
      editorMode?: boolean;
    }>;

    const rendered = await renderMediaOnWeb({
      composition: {
        id: `WallCut-${format}`,
        component,
        durationInFrames,
        fps,
        width: bundle.width || 1080,
        height: bundle.height || 1920,
        defaultProps: { renderModel: { ...renderModel, durationInFrames }, editorMode: true },
      },
      inputProps: { renderModel: { ...renderModel, durationInFrames }, editorMode: true },
      container: format,
      videoCodec: format === 'mp4' ? 'h264' : 'vp8',
      videoBitrate: 'high',
      audioBitrate: 'high',
      logLevel: 'error',
    });

    const blob = await rendered.getBlob();
    if (!blob.size) throw new Error('EXPORT_EMPTY_FILE');
    downloadBlob(blob, `${safeFileName(bundle.projectName)}.${format}`);
  } finally {
    for (const url of objectUrls) URL.revokeObjectURL(url);
  }
}

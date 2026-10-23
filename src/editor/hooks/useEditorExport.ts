import { useCallback, useState } from 'react';

import type { TTSTimeline } from '../../domain/timeline/ttsTimelineTypes';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import type { ShortsProject } from '../../domain/project/projectTypes';
import type { BackgroundStyle } from '../../domain/background/backgroundTypes';
import type { EditorAudioTrack } from '../timeline/audioTrackOperations';
import {
  createExportBundle,
  formatExportError,
  requestMediaExport,
  type ExportFormat,
} from '../export/exportService';

type UseEditorExportOptions = {
  projectName: string;
  fps: number;
  timeline: TTSTimeline;
  visualTimeline: VisualTimelineData;
  background?: BackgroundStyle;
  project?: () => ShortsProject;
  audioTracks: EditorAudioTrack[];
  localizedError: string;
};

/** Owns the export request lifecycle, keeping it separate from editor state orchestration. */
export function useEditorExport({
  projectName,
  fps,
  timeline,
  visualTimeline,
  background,
  project,
  audioTracks,
  localizedError,
}: UseEditorExportOptions) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (isExporting) return;
      setIsExporting(true);
      setExportError(null);
      try {
        // Export the current in-memory state; autosave and backend state are not prerequisites.
        const snapshot = project ? project() : undefined;
        const bundle = createExportBundle({
          projectName,
          fps,
          timeline,
          visualTimeline,
          background,
          project: snapshot,
          audioTracks,
        });
        await requestMediaExport(bundle, format);
      } catch (error) {
        const code = error instanceof Error ? error.message : 'EXPORT_FAILED';
        setExportError(formatExportError(code, localizedError));
        throw error;
      } finally {
        setIsExporting(false);
      }
    },
    [
      audioTracks,
      background,
      fps,
      isExporting,
      localizedError,
      project,
      projectName,
      timeline,
      visualTimeline,
    ],
  );

  return { isExporting, exportError, setExportError, handleExport };
}

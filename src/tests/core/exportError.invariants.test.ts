import { formatExportError } from '../../editor/export/exportService';
import { assertEqual } from './testUtils';

export function runExportErrorInvariantTests(): void {
  const localized = 'Could not export video';
  assertEqual(
    formatExportError('EXPORT_INVALID_VISUAL_TIMELINE', localized),
    localized,
    'invalid visual timeline uses the localized generic export error',
  );
  assertEqual(
    formatExportError('EXPORT_INVALID_AUDIO_TRACK', localized),
    localized,
    'invalid audio track uses the localized generic export error',
  );
  assertEqual(
    formatExportError('MEDIA_ENCODER_UNAVAILABLE', localized),
    `${localized} (MEDIA_ENCODER_UNAVAILABLE)`,
    'unexpected export failures preserve the diagnostic code',
  );
}

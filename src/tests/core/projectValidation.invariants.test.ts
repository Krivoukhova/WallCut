import { validateShortsProject } from '../../domain/project/projectValidation';
import { CURRENT_PROJECT_VERSION, type ShortsProject } from '../../domain/project/projectTypes';

function baseProject(): ShortsProject {
  return {
    version: CURRENT_PROJECT_VERSION,
    composition: { width: 1080, height: 1920, fps: 30 },
    visualTimeline: { segments: [{ id: 'scene-1', blocks: [] }] },
    metadata: { name: 'Test' },
  };
}

export function runProjectValidationInvariantTests() {
  const valid = validateShortsProject(baseProject());
  if (!valid.valid || !valid.project) throw new Error('Expected canonical project to validate');

  const invalidTimeline = validateShortsProject({
    ...baseProject(),
    visualTimeline: { segments: [{ id: 123, blocks: [] }] },
  });
  if (invalidTimeline.valid) throw new Error('Invalid segment id must be rejected');

  const duplicateAudioIds = validateShortsProject({
    ...baseProject(),
    audioTracks: [
      { id: 'voice', state: {} as never },
      { id: 'voice', state: {} as never },
    ],
  });
  if (duplicateAudioIds.valid) throw new Error('Duplicate audio track ids must be rejected');

  const invalidComposition = validateShortsProject({
    ...baseProject(),
    composition: { width: 0, height: 1920, fps: 30 },
  });
  if (invalidComposition.valid) throw new Error('Invalid composition dimensions must be rejected');
}

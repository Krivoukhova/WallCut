import { assert, assertEqual } from './testUtils';
import { CURRENT_PROJECT_VERSION } from '../../domain/project/projectDocument';
import {
  getProjectMigrationPath,
  migrateProject,
} from '../../domain/project/migrations/projectMigrations';

export function runMigrationInvariantTests(): void {
  assertEqual(CURRENT_PROJECT_VERSION, 4, 'current project version is stable');
  assertEqual(
    getProjectMigrationPath(1).join(','),
    '2,3,4',
    'v1 migrates through every intermediate version',
  );

  const result = migrateProject({
    version: 1,
    visualTimeline: { segments: [] },
    audio: {
      assetId: 'audio-1',
      state: {
        startFrame: 0,
        durationFrames: 30,
        sourceStartFrame: 0,
        sourceEndFrame: 30,
        volume: 1,
        muted: false,
      },
    },
  });

  assert(result.migrated, 'legacy project reports that it was migrated');
  assertEqual(result.fromVersion, 1, 'migration records source version');
  assertEqual(result.toVersion, 4, 'migration reaches current version');
  assertEqual(result.project.version, 4, 'migrated project has current version');
  assertEqual(result.project.composition.fps, 30, 'v1 receives historical composition defaults');
  assertEqual(
    result.project.audioTracks?.[0]?.assetId,
    'audio-1',
    'legacy audio asset id is preserved',
  );

  let unsupported = false;
  try {
    migrateProject({ version: 999 });
  } catch (error) {
    unsupported = String(error).includes('UNSUPPORTED_PROJECT_VERSION:999');
  }
  assert(unsupported, 'future project versions fail explicitly');
}

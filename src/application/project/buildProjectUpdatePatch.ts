import type { ShortsProject } from '../../domain/project/projectTypes';
import type { AudioAssetPatch } from './buildAudioAssetPatch';
import type { ProjectPatch } from './projectService';

export type ProjectUpdateInput = {
  name?: string;
  project: ShortsProject;
  audioAssets: AudioAssetPatch | undefined;
};

/** Build the shared persistence patch used by manual save and autosave. */
export function buildProjectUpdatePatch(input: ProjectUpdateInput): ProjectPatch {
  return {
    name: input.name,
    project: input.project,
    ...(input.audioAssets === undefined ? {} : { audioAssets: input.audioAssets }),
  };
}

import type { ShortsProject } from '../../domain/project/projectTypes';
import type { AudioAssetPatch } from './buildAudioAssetPatch';
import { buildProjectUpdatePatch } from './buildProjectUpdatePatch';
import type { ProjectService, LocalProject } from './projectService';
import { persistProjectUpdate } from '../autosave/persistProjectUpdate';

export type UpdateProjectDocumentInput = {
  projectService: Pick<ProjectService, 'updateProject'>;
  projectId: string;
  projectName?: string;
  project: ShortsProject;
  audioAssets: AudioAssetPatch | undefined;
  failureCode: string;
};

/** Persist a prepared editor snapshot with the same patch semantics for manual and automatic saves. */
export async function updateProjectDocument(
  input: UpdateProjectDocumentInput,
): Promise<LocalProject> {
  const { projectService, projectId, projectName, project, audioAssets, failureCode } = input;
  return persistProjectUpdate(
    () => projectService.updateProject(
      projectId,
      buildProjectUpdatePatch({ name: projectName, project, audioAssets }),
    ),
    failureCode,
  );
}

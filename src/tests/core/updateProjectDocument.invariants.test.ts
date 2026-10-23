import type { ShortsProject } from '../../domain/project/projectTypes';
import type { LocalProject, ProjectPatch } from '../../application/project/projectService';
import { updateProjectDocument } from '../../application/project/updateProjectDocument';
import { assert, assertEqual } from './testUtils';

export async function runUpdateProjectDocumentInvariantTests(): Promise<void> {
  const project = { metadata: { name: 'WallCut' } } as ShortsProject;
  const saved = { id: 'project-1' } as LocalProject;
  let capturedPatch: ProjectPatch | undefined;
  const projectService = {
    async updateProject(_id: string, patch: ProjectPatch) {
      capturedPatch = patch;
      return saved;
    },
  };

  const result = await updateProjectDocument({
    projectService,
    projectId: 'project-1',
    projectName: 'WallCut',
    project,
    audioAssets: undefined,
    failureCode: 'PROJECT_SAVE_FAILED',
  });
  assertEqual(result, saved, 'project update returns the persisted project');
  assertEqual(capturedPatch?.name, 'WallCut', 'project name is included in the update patch');
  assertEqual(capturedPatch?.project, project, 'snapshot is included without transformation');
  assert(!Object.prototype.hasOwnProperty.call(capturedPatch, 'audioAssets'), 'undefined audio assets are omitted');

  let failureCode = '';
  try {
    await updateProjectDocument({
      projectService: { async updateProject() { return null; } },
      projectId: 'missing',
      project,
      audioAssets: undefined,
      failureCode: 'PROJECT_AUTOSAVE_FAILED',
    });
  } catch (error) {
    failureCode = error instanceof Error ? error.message : '';
  }
  assertEqual(failureCode, 'PROJECT_AUTOSAVE_FAILED', 'autosave can supply its own missing-project failure code');
}

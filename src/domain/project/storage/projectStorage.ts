import type { ProjectDocument } from '../projectDocument';

/** Persisted project aggregate used by the application and storage adapters. */
export type ProjectRecord = {
  id: string;
  ownerId: string;
  name: string;
  template: 'blank' | 'starter';
  createdAt: string;
  updatedAt: string;
  project: ProjectDocument;
};

/**
 * Persistence port for project documents only.
 * Binary assets are deliberately handled by AssetRepository.
 * All project reads are scoped to an owner to prevent cross-user access.
 */
export interface ProjectStorage {
  listProjects(ownerId: string): Promise<ProjectRecord[]>;
  getProject(ownerId: string, id: string): Promise<ProjectRecord | null>;
  putProject(project: ProjectRecord): Promise<void>;
  deleteProject(ownerId: string, id: string): Promise<void>;
}

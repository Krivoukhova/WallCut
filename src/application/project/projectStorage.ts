/**
 * Compatibility re-export for application use cases.
 * The persistence contract itself belongs to the domain layer so adapters
 * can implement it without importing application orchestration.
 */
export type { ProjectRecord, ProjectStorage } from '../../domain/project/storage/projectStorage';

import { CURRENT_PROJECT_VERSION, type ShortsProject } from './projectTypes';
import { validateVisualTimeline } from '../validation/schema';
import { isBackgroundStyle } from '../background/backgroundTypes';

export function validateShortsProject(value: unknown): {
  valid: boolean;
  project: ShortsProject | null;
  issues: Array<{ path: string; message: string; severity: 'error' | 'warning' }>;
} {
  const issues: Array<{ path: string; message: string; severity: 'error' | 'warning' }> = [];

  if (!value || typeof value !== 'object') {
    return {
      valid: false,
      project: null,
      issues: [{ path: 'project', message: 'Project must be an object', severity: 'error' }],
    };
  }

  const project = value as Partial<ShortsProject>;
  if (project.version !== CURRENT_PROJECT_VERSION) {
    issues.push({ path: 'version', message: 'Unsupported project version', severity: 'error' });
  }

  if (project.background !== undefined && !isBackgroundStyle(project.background)) {
    issues.push({
      path: 'background',
      message: 'Project background has an invalid style',
      severity: 'error',
    });
  }

  const composition = project.composition;
  if (!composition || typeof composition !== 'object') {
    issues.push({ path: 'composition', message: 'Composition is required', severity: 'error' });
  } else {
    if (!Number.isFinite(composition.width) || composition.width <= 0)
      issues.push({
        path: 'composition.width',
        message: 'Width must be positive',
        severity: 'error',
      });
    if (!Number.isFinite(composition.height) || composition.height <= 0)
      issues.push({
        path: 'composition.height',
        message: 'Height must be positive',
        severity: 'error',
      });
    if (!Number.isFinite(composition.fps) || composition.fps <= 0)
      issues.push({ path: 'composition.fps', message: 'FPS must be positive', severity: 'error' });
  }

  const timeline = validateVisualTimeline(project.visualTimeline);
  issues.push(
    ...timeline.issues.map((issue) => ({
      path: `visualTimeline${issue.path === '.' ? '' : issue.path.startsWith('[') ? issue.path : `.${issue.path}`}`,
      message: issue.message,
      severity: issue.severity,
    })),
  );

  if (project.audio !== undefined) {
    if (!project.audio || typeof project.audio !== 'object')
      issues.push({ path: 'audio', message: 'Audio must be an object', severity: 'error' });
    else if (!project.audio.state || typeof project.audio.state !== 'object')
      issues.push({ path: 'audio.state', message: 'Audio state is required', severity: 'error' });
  }

  if (project.audioTracks !== undefined) {
    if (!Array.isArray(project.audioTracks))
      issues.push({
        path: 'audioTracks',
        message: 'audioTracks must be an array',
        severity: 'error',
      });
    else {
      const ids = new Set<string>();
      project.audioTracks.forEach((track, index) => {
        const path = `audioTracks[${index}]`;
        if (!track || typeof track !== 'object') {
          issues.push({ path, message: 'Track must be an object', severity: 'error' });
          return;
        }
        if (typeof track.id !== 'string' || track.id.length === 0)
          issues.push({ path: `${path}.id`, message: 'Track id is required', severity: 'error' });
        else if (ids.has(track.id))
          issues.push({
            path: `${path}.id`,
            message: 'Track id must be unique',
            severity: 'error',
          });
        else ids.add(track.id);
        if (!track.state || typeof track.state !== 'object')
          issues.push({
            path: `${path}.state`,
            message: 'Track state is required',
            severity: 'error',
          });
      });
    }
  }

  const valid = issues.every((issue) => issue.severity !== 'error');
  return {
    valid,
    project: valid ? ({ ...project, visualTimeline: timeline.data } as ShortsProject) : null,
    issues,
  };
}

export function isValidShortsProject(value: unknown): value is ShortsProject {
  return validateShortsProject(value).valid;
}

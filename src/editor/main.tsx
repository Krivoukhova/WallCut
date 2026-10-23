import ReactDOM from 'react-dom/client';

import { Dashboard } from './Dashboard';
import { Editor } from './Editor';
import { EditorErrorBoundary } from './EditorErrorBoundary';
import { I18nProvider, useI18n } from './i18n/I18nContext';

import timeline from '../data/timeline.json';
import visualTimeline from '../data/visualTimeline.json';

import type { TTSTimeline } from '../domain/timeline/ttsTimelineTypes';
import type { VisualTimelineData } from '../domain/timeline/visualTimelineTypes';
import { ProjectService } from '../application/project/projectService';
import { getOrCreateGuestAccount } from '../infrastructure/account/guestAccount';
import { projectStorage, assetRepository } from '../infrastructure/storage/indexedDbProjectStorage';
import { webApplicationRuntime } from '../infrastructure/runtime/webRuntime';

const createProjectService = (accountId: string): ProjectService =>
  new ProjectService(
    projectStorage,
    assetRepository,
    accountId,
    webApplicationRuntime.ids,
    webApplicationRuntime.clone,
  );

// Reset the page layout so every route can use the full viewport.
const appBaseStyle = document.createElement('style');
appBaseStyle.textContent = `html, body, #root { margin: 0; min-height: 100%; width: 100%; background: #111; } * { box-sizing: border-box; } body { overflow-x: hidden; }`;
document.head.appendChild(appBaseStyle);

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

void (async () => {
  // Use a stable local guest identity to scope project data without requiring sign-in.
  const params = new URLSearchParams(window.location.search);
  const account = getOrCreateGuestAccount();
  const projectService = createProjectService(account.id);
  const projectId = params.get('project');
  const isEditorRoute = window.location.pathname === '/editor';

  if (isEditorRoute) {
    let project: Awaited<ReturnType<typeof projectService.getProject>> = null;
    let loadError: Error | null = null;

    if (projectId) {
      try {
        project = await projectService.getProject(projectId);
        if (!project) loadError = new Error('PROJECT_NOT_FOUND');
      } catch (error) {
        loadError = error instanceof Error ? error : new Error('PROJECT_LOAD_FAILED');
      }
    }

    if (loadError) {
      const LoadErrorScreen = () => {
        const { translations: t } = useI18n();
        return (
          <main
            style={{
              minHeight: '100vh',
              padding: 32,
              boxSizing: 'border-box',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            <h1>{t.errors.projectOpenFailed}</h1>
            <p>{loadError.message}</p>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
            >
              {t.errors.backToDashboard}
            </button>
          </main>
        );
      };
      ReactDOM.createRoot(root).render(
        <I18nProvider>
          <LoadErrorScreen />
        </I18nProvider>,
      );
      return;
    }

    // Keep translations available to both the error boundary and editor. The editor
    // can still override the language through its uiLanguage property.
    ReactDOM.createRoot(root).render(
      <I18nProvider>
        <EditorErrorBoundary>
          <Editor
            projectService={projectService}
            runtime={webApplicationRuntime}
            timeline={timeline as TTSTimeline}
            visualTimeline={
              project?.project?.visualTimeline ?? (visualTimeline as VisualTimelineData)
            }
            projectDocument={project?.project}
            projectId={projectId ?? undefined}
            projectName={project?.name}
            projectAudioTracks={project?.audioTracks}
          />
        </EditorErrorBoundary>
      </I18nProvider>,
    );
    return;
  }

  ReactDOM.createRoot(root).render(<Dashboard projectService={projectService} />);
})();

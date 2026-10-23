import React, { useCallback, useEffect, useState } from 'react';

import { I18nProvider, useI18n } from './i18n/I18nContext';
import type { LanguageCode } from '../domain/i18n/types';

import visualTimeline from '../data/visualTimeline.json';
import type { VisualTimelineData } from '../domain/timeline/visualTimelineTypes';
import type { LocalProject, ProjectService } from '../application/project/projectService';

import { LANGUAGE_OPTIONS } from '../domain/i18n/languageOptions';
const DEFAULT_VISUAL_TIMELINE = visualTimeline as VisualTimelineData;

const createBlankVisualTimeline = (): VisualTimelineData => ({
  // A blank project starts with exactly one empty scene. Keep the first
  // scene's background settings, but never copy example content or scenes.
  segments: [
    {
      ...DEFAULT_VISUAL_TIMELINE.segments[0],
      id: 'f1',
      name: 'Scene 1',
      blocks: [],
    },
  ],
});

const formatDate = (value: string, language: LanguageCode): string => {
  try {
    return new Intl.DateTimeFormat(
      ({ ru: 'ru-RU', en: 'en-US', es: 'es-ES', zh: 'zh-CN', hi: 'hi-IN', it: 'it-IT', de: 'de-DE' })[language],
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    ).format(new Date(value));
  } catch {
    return value;
  }
};

type DashboardProps = { projectService: ProjectService };

export const Dashboard: React.FC<DashboardProps> = ({ projectService }) => (
  <I18nProvider>
    <DashboardContent projectService={projectService} />
  </I18nProvider>
);

const DashboardContent: React.FC<DashboardProps> = ({ projectService }) => {
  const { language, setLanguage, translations: t } = useI18n();
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoadError(null);
      setProjects(await projectService.listProjects());
    } catch (error) {
      const partial = error as { projects?: LocalProject[] };
      if (Array.isArray(partial.projects)) setProjects(partial.projects);
      setLoadError(error instanceof Error ? error.message : 'PROJECT_LIST_FAILED');
    }
  }, [projectService]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openProject = (id: string) => {
    window.location.href = `/editor?project=${encodeURIComponent(id)}`;
  };

  const handleNewProject = async (template: 'blank' | 'starter') => {
    const isStarter = template === 'starter';
    const project = await projectService.createProject(
      isStarter ? DEFAULT_VISUAL_TIMELINE : createBlankVisualTimeline(),
      isStarter ? 'Creator Studio — Starter Project' : t.dashboard.blankTemplate,
      template,
    );
    setShowTemplates(false);
    openProject(project.id);
  };

  const openTemplatePicker = () => setShowTemplates(true);

  const handleDelete = (project: LocalProject) => {
    if (!window.confirm(`${t.dashboard.deleteConfirm}\n\n${project.name}`)) return;
    void projectService.deleteProject(project.id).then(refresh);
  };

  const handleDuplicate = (project: LocalProject) => {
    void projectService.duplicateProject(project.id).then(refresh);
  };

  const startRename = (project: LocalProject) => {
    setEditingId(project.id);
    setEditingName(project.name);
  };

  const finishRename = () => {
    if (!editingId) return;
    const name = editingName.trim() || t.dashboard.newProjectDefault;
    const id = editingId;
    setEditingId(null);
    setEditingName('');
    void projectService.updateProject(id, { name }).then(refresh);
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>WallCut</div>
        <div style={styles.headerActions}>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as LanguageCode)}
            style={styles.select}
            aria-label={t.common.language}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={openTemplatePicker} style={styles.primaryButton}>
            + {t.dashboard.newProject}
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {loadError ? (
          <div role="alert" style={styles.errorBanner}>
            {t.errors.projectsLoadPartial} {loadError}
          </div>
        ) : null}
        <div style={styles.titleRow}>
          <div>
            <h1 style={styles.title}>{t.dashboard.title}</h1>
            <p style={styles.subtitle}>{t.dashboard.subtitle}</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <section style={styles.emptyCard}>
            <div style={styles.emptyIcon}>＋</div>
            <h2 style={styles.emptyTitle}>{t.dashboard.emptyTitle}</h2>
            <p style={styles.emptyText}>{t.dashboard.emptyText}</p>
            <button type="button" onClick={openTemplatePicker} style={styles.primaryButton}>
              {t.dashboard.createFirst}
            </button>
          </section>
        ) : (
          <section style={styles.grid}>
            {projects.map((project) => (
              <article key={project.id} style={styles.card}>
                <button
                  type="button"
                  onClick={() => openProject(project.id)}
                  style={styles.preview}
                >
                  <div style={styles.previewCanvas}>
                    <div style={styles.previewText}>
                      Creator
                      <br />
                      Studio
                    </div>
                  </div>
                </button>

                <div style={styles.cardBody}>
                  {editingId === project.id ? (
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      onBlur={finishRename}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') finishRename();
                        if (event.key === 'Escape') {
                          setEditingId(null);
                          setEditingName('');
                        }
                      }}
                      style={styles.nameInput}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => openProject(project.id)}
                      style={styles.nameButton}
                    >
                      {project.name}
                    </button>
                  )}

                  <div style={styles.meta}>
                    {t.dashboard.updated}: {formatDate(project.updatedAt, language)}
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      type="button"
                      onClick={() => openProject(project.id)}
                      style={styles.actionButton}
                    >
                      {t.dashboard.open}
                    </button>
                    <button
                      type="button"
                      onClick={() => startRename(project)}
                      style={styles.actionButton}
                    >
                      {t.dashboard.rename}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(project)}
                      style={styles.actionButton}
                    >
                      {t.dashboard.duplicate}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(project)}
                      style={styles.dangerButton}
                    >
                      {t.dashboard.delete}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      {showTemplates ? (
        <div
          style={styles.modalBackdrop}
          role="presentation"
          onMouseDown={() => setShowTemplates(false)}
        >
          <section
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-picker-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div>
                <h2 id="template-picker-title" style={styles.modalTitle}>
                  {t.dashboard.templateTitle}
                </h2>
                <p style={styles.modalSubtitle}>{t.dashboard.templateSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplates(false)}
                style={styles.closeButton}
                aria-label={t.dashboard.cancel}
              >
                ×
              </button>
            </div>

            <div style={styles.templateGrid}>
              <button
                type="button"
                onClick={() => handleNewProject('blank')}
                style={styles.templateCard}
              >
                <div style={styles.templatePreview}>
                  <div style={styles.blankPreview}>
                    <div style={styles.previewGlow} />
                    <div style={styles.previewChart} />
                    <div style={styles.previewNumber}>35%</div>
                  </div>
                </div>
                <div style={styles.templateName}>{t.dashboard.blankTemplate}</div>
                <div style={styles.templateDescription}>{t.dashboard.blankTemplateDescription}</div>
              </button>

              <button
                type="button"
                onClick={() => handleNewProject('starter')}
                style={styles.templateCard}
              >
                <div style={styles.templatePreview}>
                  <div style={styles.starterPreview}>
                    <span>INFLATION</span>
                    <strong>35%</strong>
                    <small>PRICE GROWTH</small>
                  </div>
                </div>
                <div style={styles.templateName}>{t.dashboard.starterTemplate}</div>
                <div style={styles.templateDescription}>
                  {t.dashboard.starterTemplateDescription}
                </div>
              </button>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setShowTemplates(false)}
                style={styles.actionButton}
              >
                {t.dashboard.cancel}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100%',
    minHeight: '100vh',
    background: '#111',
    color: '#fff',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    height: 64,
    padding: '0 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #292929',
    background: '#181818',
    boxSizing: 'border-box',
  },
  brand: { fontSize: 18, fontWeight: 700 },
  headerActions: { display: 'flex', alignItems: 'center', gap: 10 },
  select: {
    height: 36,
    border: '1px solid #3a3a3a',
    borderRadius: 7,
    background: '#222',
    color: '#fff',
    padding: '0 10px',
  },
  primaryButton: {
    height: 36,
    border: '1px solid #fff',
    borderRadius: 7,
    background: '#fff',
    color: '#111',
    padding: '0 14px',
    cursor: 'pointer',
    fontWeight: 650,
  },
  main: { maxWidth: 1280, margin: '0 auto', padding: 32 },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  title: { margin: 0, fontSize: 30 },
  subtitle: { margin: '8px 0 0', color: '#888', fontSize: 14 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 18 },
  card: {
    overflow: 'hidden',
    border: '1px solid #303030',
    borderRadius: 10,
    background: '#191919',
  },
  preview: { width: '100%', padding: 18, border: 0, background: '#151515', cursor: 'pointer' },
  previewCanvas: {
    width: 126,
    aspectRatio: '9 / 16',
    margin: '0 auto',
    borderRadius: 5,
    background: '#242424',
    border: '1px solid #3b3b3b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: { textAlign: 'center', fontSize: 14, fontWeight: 700, lineHeight: 1.2 },
  cardBody: { padding: 14 },
  nameButton: {
    width: '100%',
    padding: 0,
    border: 0,
    background: 'transparent',
    color: '#fff',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 650,
  },
  nameInput: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #555',
    borderRadius: 5,
    background: '#111',
    color: '#fff',
    padding: '7px 8px',
    fontSize: 15,
  },
  meta: { marginTop: 7, color: '#777', fontSize: 11 },
  cardActions: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 13 },
  actionButton: {
    border: '1px solid #3a3a3a',
    borderRadius: 5,
    background: '#242424',
    color: '#ddd',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: 11,
  },
  dangerButton: {
    border: '1px solid #4a2929',
    borderRadius: 5,
    background: '#241818',
    color: '#e99',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: 11,
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    background: 'rgba(0,0,0,0.68)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    boxSizing: 'border-box',
  },
  modal: {
    width: 'min(760px, 100%)',
    border: '1px solid #363636',
    borderRadius: 14,
    background: '#181818',
    boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
    padding: 24,
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  modalTitle: { margin: 0, fontSize: 22 },
  modalSubtitle: { margin: '7px 0 0', color: '#888', fontSize: 13 },
  closeButton: {
    width: 32,
    height: 32,
    border: '1px solid #3a3a3a',
    borderRadius: 7,
    background: '#222',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: 22,
    lineHeight: 1,
  },
  templateGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 },
  templateCard: {
    border: '1px solid #383838',
    borderRadius: 10,
    background: '#202020',
    color: '#fff',
    padding: 12,
    textAlign: 'left',
    cursor: 'pointer',
  },
  templatePreview: {
    height: 250,
    borderRadius: 7,
    border: '1px solid #353535',
    background: '#111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blankPreview: {
    position: 'relative',
    width: 116,
    height: 206,
    border: '1px solid #444',
    borderRadius: 5,
    background: 'linear-gradient(180deg, #101b24 0%, #080d12 100%)',
    overflow: 'hidden',
  },
  previewGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: '50%',
    background: 'rgba(15,201,240,0.12)',
    left: 13,
    top: 28,
  },
  previewChart: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 38,
    height: 58,
    borderBottom: '2px solid #0fc9f0',
    borderLeft: '2px solid #26343d',
    transform: 'skewY(-12deg)',
  },
  previewNumber: {
    position: 'absolute',
    top: 84,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 21,
    fontWeight: 800,
    color: '#0fc9f0',
  },
  starterPreview: {
    width: 116,
    height: 206,
    border: '1px solid #444',
    borderRadius: 5,
    background: '#242424',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    textAlign: 'center',
    fontSize: 8,
  },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', marginTop: 18 },
  templateName: { marginTop: 12, fontSize: 15, fontWeight: 700 },
  templateDescription: { marginTop: 5, color: '#888', fontSize: 12, lineHeight: 1.45 },
  errorBanner: {
    marginBottom: 16,
    padding: '10px 12px',
    border: '1px solid #5a3434',
    borderRadius: 7,
    background: '#241818',
    color: '#e8aaaa',
    fontSize: 13,
  },
  emptyCard: {
    maxWidth: 520,
    margin: '70px auto',
    padding: '50px 30px',
    textAlign: 'center',
    border: '1px dashed #444',
    borderRadius: 12,
    background: '#181818',
  },
  emptyIcon: { fontSize: 38, color: '#aaa' },
  emptyTitle: { margin: '15px 0 8px', fontSize: 20 },
  emptyText: { margin: '0 auto 22px', color: '#888', lineHeight: 1.5, fontSize: 14 },
};

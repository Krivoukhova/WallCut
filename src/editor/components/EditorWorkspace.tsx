import { uiText } from '../../domain/i18n/uiText';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';

import { type PlayerRef } from '@remotion/player';

import { EditorLibrary } from '../EditorLibrary';
import { useI18n } from '../i18n/I18nContext';
import { EditorInspector } from '../EditorInspector';
import { EditorOverlay } from '../../components/EditorOverlay';
import { EditorPlayerStage } from './EditorPlayerStage';
import { EDITOR_WORKSPACE_TEXT } from './editorWorkspaceText';
import { useEditorWorkspacePreferences } from './useEditorWorkspacePreferences';
import {
  MAX_LIBRARY_WIDTH,
  MIN_LIBRARY_WIDTH,
  MIN_INSPECTOR_WIDTH,
  useWorkspacePanelResize,
} from './useWorkspacePanelResize';
import { useSceneReordering } from './useSceneReordering';
import { compileRenderModel } from '../../renderer/renderModel';

import type { TTSTimeline, TTSSegment } from '../../domain/timeline/ttsTimelineTypes';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import type { BackgroundStyle } from '../../domain/background/backgroundTypes';
import type { ResolvedEditorBlock } from '../editorTypes';
import type { LocalAudioTrack } from '../../application/project/projectService';

type EditorWorkspaceProps = {
  timeline: TTSTimeline;
  editorTimeline: VisualTimelineData;
  projectBackground?: BackgroundStyle | null;
  onProjectBackgroundChange?: (background: BackgroundStyle) => void;

  onPlayerRef?: (ref: PlayerRef | null) => void;

  setCurrentFrame: (frame: number) => void;

  editorDuration: number;

  activeBlocks: ResolvedEditorBlock[];

  selectedBlockId: string | null;
  selectedBlockIds: string[];
  selectBlock: (id: string | null, additive?: boolean) => void;
  inspectorProps: React.ComponentProps<typeof EditorInspector>;

  handleAddBlock: (
    type: Parameters<React.ComponentProps<typeof EditorLibrary>['onAddBlock']>[0],
  ) => void;

  handleMove: React.ComponentProps<typeof EditorOverlay>['onMove'];

  handleResize: React.ComponentProps<typeof EditorOverlay>['onResize'];

  handleRotate: React.ComponentProps<typeof EditorOverlay>['onRotate'];

  handleResizeSelection: React.ComponentProps<typeof EditorOverlay>['onResizeSelection'];

  handleRotateSelection: React.ComponentProps<typeof EditorOverlay>['onRotateSelection'];

  beginInteraction: () => void;
  endInteraction: () => void;
  onStackChildTextChange?: (stackId: string, childId: string, text: string) => void;
  audioTracks?: Array<LocalAudioTrack & { publicPath: string }>;
  scenes: TTSSegment[];
  selectedSceneId?: string | null;
  onSceneSelect: (sceneId: string) => void;
  onSceneAdd: () => void;
  onSceneDuplicate: (sceneId?: string) => void;
  onSceneDelete: (sceneId?: string) => void;
  onSceneReorder: (sceneId: string, targetIndex: number) => void;
};

const RESIZE_HANDLE_WIDTH = 8;

const sceneSmallButtonStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  padding: 0,
  borderRadius: 5,
  border: '1px solid #454545',
  background: '#181818',
  color: '#e5e7eb',
  cursor: 'pointer',
  fontSize: 14,
};

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  timeline,
  editorTimeline,
  projectBackground,
  onProjectBackgroundChange,

  onPlayerRef,

  setCurrentFrame,

  editorDuration,

  activeBlocks,

  selectedBlockId,
  selectedBlockIds,
  selectBlock,

  inspectorProps,

  handleAddBlock,

  handleMove,
  handleResize,
  handleRotate,
  handleResizeSelection,
  handleRotateSelection,

  beginInteraction,
  endInteraction,
  onStackChildTextChange,
  audioTracks = [],
  scenes,
  selectedSceneId,
  onSceneSelect,
  onSceneAdd,
  onSceneDuplicate,
  onSceneDelete,
  onSceneReorder,
}) => {
  const { language } = useI18n();
  const panelText = EDITOR_WORKSPACE_TEXT[language];
  const {
    bladeActiveUi,
    quickAccessEnabled,
    setQuickAccessEnabled,
    sceneQuickAccessEnabled,
    setSceneQuickAccessEnabled,
  } = useEditorWorkspacePreferences();
  const [leftPanelTab, setLeftPanelTab] = useState<'elements' | 'scenes' | 'tools' | null>(null);
  const {
    libraryWidth,
    inspectorWidth,
    handleResizePointerDown,
    handleResizePointerMove,
    finishResize,
    handleInspectorResizePointerDown,
    handleInspectorResizePointerMove,
    finishInspectorResize,
  } = useWorkspacePanelResize();
  const [sceneContextMenu, setSceneContextMenu] = useState<{
    x: number;
    y: number;
    sceneId: string | null;
  } | null>(null);
  const {
    draggedSceneId,
    sceneDropIndex,
    getScenePointerHandlers,
    shouldSuppressSceneClick,
  } = useSceneReordering(scenes, onSceneReorder);

  const playerRef = useRef<PlayerRef | null>(null);

  const wasPlayerPlayingRef = useRef(false);

  const playerAudioTracks = useMemo(
    () =>
      audioTracks.map((track) => ({
        id: track.id,
        publicPath: track.publicPath,
        state: track.state,
      })),
    [audioTracks],
  );

  const renderModel = useMemo(
    () => compileRenderModel(editorTimeline, timeline.fps, playerAudioTracks, projectBackground),
    [editorTimeline, timeline.fps, playerAudioTracks, projectBackground],
  );

  const playerInputProps = useMemo(
    () => ({
      renderModel,
      editorMode: true,
      onStackChildTextChange,
    }),
    [renderModel, onStackChildTextChange],
  );

  /*
   * Keep the timeline playhead locked to the real Player clock.
   * Reading the Player clock continuously also keeps manual seeks in sync.
   */
  useEffect(() => {
    const handlePlaybackShortcut = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;

      const target = event.target as HTMLElement | null;
      const isEditable =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if (isEditable) return;

      const player = playerRef.current;
      if (!player) return;

      event.preventDefault();
      if (player.isPlaying()) {
        player.pause();
      } else {
        player.play();
      }
    };

    window.addEventListener('keydown', handlePlaybackShortcut);
    return () => window.removeEventListener('keydown', handlePlaybackShortcut);
  }, []);

  useEffect(() => {
    let raf = 0;
    let mounted = true;

    const syncPlayerFrame = () => {
      if (!mounted) return;

      const player = playerRef.current;
      if (player) {
        const frame = player.getCurrentFrame();
        const isPlaying = player.isPlaying();
        const wasPlaying = wasPlayerPlayingRef.current;

        // Remotion Player in this version does not expose an onEnded/onPlaybackEnd
        // prop. Detect a natural playback stop at the final frame instead.
        if (wasPlaying && !isPlaying && editorDuration > 0 && frame >= editorDuration - 1) {
          player.seekTo(0);
          setCurrentFrame(0);
        } else {
          setCurrentFrame(frame);
        }

        wasPlayerPlayingRef.current = isPlaying;
      }

      raf = window.requestAnimationFrame(syncPlayerFrame);
    };

    raf = window.requestAnimationFrame(syncPlayerFrame);

    return () => {
      mounted = false;
      window.cancelAnimationFrame(raf);
    };
  }, [editorDuration, setCurrentFrame]);

  const handlePlayerRef = useCallback(
    (ref: PlayerRef | null) => {
      playerRef.current = ref;

      onPlayerRef?.(ref);
    },
    [onPlayerRef],
  );

  const jumpToSceneStart = useCallback(
    (frame: number) => {
      setCurrentFrame(frame);
      // Seek after scene selection has rendered so the player-frame sync loop
      // does not immediately overwrite the requested position.
      window.requestAnimationFrame(() => {
        playerRef.current?.seekTo(frame);
        setCurrentFrame(frame);
      });
    },
    [setCurrentFrame],
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',

        minWidth: 0,
        minHeight: 0,

        display: 'flex',

        position: 'relative',

        padding: '12px 0',

        boxSizing: 'border-box',

        overflow: 'hidden',
      }}
    >

      <div
        style={{
          flex: '0 0 48px',
          width: 48,
          minWidth: 48,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#151922',
          borderRight: '1px solid #292f3b',
          boxSizing: 'border-box',
          padding: '10px 5px',
          gap: 8,
        }}
      >
        {[
          { id: 'elements' as const, icon: 'layers', label: uiText(language, 'elements') },
          { id: 'scenes' as const, icon: 'film', label: uiText(language, 'scenes') },
          { id: 'tools' as const, icon: 'scissors', label: uiText(language, 'tools') },
        ].map((item) => {
          const active = leftPanelTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              onClick={() => setLeftPanelTab((current) => (current === item.id ? null : item.id))}
              aria-pressed={active}
              style={{
                width: 36,
                height: 36,
                flex: '0 0 36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                borderRadius: 7,
                border: `1px solid ${active ? '#60a5fa' : 'transparent'}`,
                background: active ? 'linear-gradient(145deg, #3b82f6, #2563eb)' : 'transparent',
                color: active ? '#ffffff' : '#929aa6',
                boxShadow: active
                  ? '0 2px 8px rgba(37,99,235,.32), inset 0 1px 0 rgba(255,255,255,.18)'
                  : 'none',
                cursor: 'pointer',
              }}
            >
              {item.icon === 'layers' ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m12 3 9 5-9 5-9-5 9-5Z" />
                  <path d="m3 12 9 5 9-5" />
                  <path d="m3 16 9 5 9-5" />
                </svg>
              ) : item.icon === 'film' ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="m7 4 5 16M17 4l-5 16M3 9h18M3 15h18" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="6" cy="6" r="2.5" />
                  <circle cx="18" cy="18" r="2.5" />
                  <path d="m8 8 8 8M14 4l6 6M4 14l6 6" />
                </svg>
              )}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
      </div>

      {leftPanelTab !== null && (
        <div
          style={{
            flex: '0 0 auto',
            width: libraryWidth,
            minWidth: MIN_LIBRARY_WIDTH,
            maxWidth: MAX_LIBRARY_WIDTH,
            minHeight: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            background: '#202020',
            borderRight: '1px solid #333',
            borderRadius: '0 8px 8px 0',
          }}
        >
          {leftPanelTab === 'elements' ? (
            <EditorLibrary width={libraryWidth} onAddBlock={handleAddBlock} />
          ) : leftPanelTab === 'scenes' ? (
            <div
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                // Right-clicking a scene card is handled by the card itself.
                setSceneContextMenu({ x: event.clientX, y: event.clientY, sceneId: null });
              }}
              onClick={() => setSceneContextMenu(null)}
              style={{
                width: '100%',
                flex: '1 1 auto',
                minWidth: 0,
                minHeight: 0,
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '10px 14px 10px 10px',
                boxSizing: 'border-box',
                background: '#202020',
                color: '#e5e7eb',
                borderRadius: '0 8px 8px 0',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 6,
                  marginBottom: 10,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700 }}>{panelText.projectScenes}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    type="button"
                    title={panelText.addScene}
                    onClick={onSceneAdd}
                    style={sceneSmallButtonStyle}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    title={panelText.duplicate}
                    aria-label={panelText.duplicate}
                    disabled={!selectedSceneId}
                    onClick={() => selectedSceneId && onSceneDuplicate(selectedSceneId)}
                    style={{
                      ...sceneSmallButtonStyle,
                      opacity: selectedSceneId ? 1 : 0.45,
                      cursor: selectedSceneId ? 'pointer' : 'not-allowed',
                    }}
                  >
                    ⧉
                  </button>
                  <button
                    type="button"
                    title={panelText.delete}
                    aria-label={panelText.delete}
                    disabled={!selectedSceneId || scenes.length <= 1}
                    onClick={() => selectedSceneId && onSceneDelete(selectedSceneId)}
                    style={{
                      ...sceneSmallButtonStyle,
                      color: '#fca5a5',
                      opacity: selectedSceneId && scenes.length > 1 ? 1 : 0.45,
                      cursor: selectedSceneId && scenes.length > 1 ? 'pointer' : 'not-allowed',
                    }}
                  >
                    −
                  </button>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '8px 0 10px',
                  marginBottom: 8,
                  borderBottom: '1px solid #363636',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: '#d7deea' }}>{panelText.sceneQuick}</div>
                  <div style={{ fontSize: 11, color: '#929292', marginTop: 3 }}>
                    {sceneQuickAccessEnabled ? panelText.sceneOn : panelText.sceneOff}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={sceneQuickAccessEnabled}
                  aria-label={panelText.sceneQuick}
                  title={sceneQuickAccessEnabled ? panelText.hideScenes : panelText.showScenes}
                  onClick={() => setSceneQuickAccessEnabled((value) => !value)}
                  style={{
                    width: 38,
                    height: 22,
                    flex: '0 0 38px',
                    padding: 2,
                    border: '1px solid #555',
                    borderRadius: 999,
                    background: sceneQuickAccessEnabled ? '#6b7280' : '#252525',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sceneQuickAccessEnabled ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      boxShadow: '0 1px 3px #0006',
                    }}
                  />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {scenes.map((scene, index) => {
                  const active = scene.id === selectedSceneId;
                  const isDragging = draggedSceneId === scene.id;
                  const showDropBefore =
                    draggedSceneId !== null &&
                    draggedSceneId !== scene.id &&
                    sceneDropIndex === index;
                  const showDropAfter =
                    draggedSceneId !== null &&
                    draggedSceneId !== scene.id &&
                    sceneDropIndex === index + 1;
                  const scenePointerHandlers = getScenePointerHandlers(scene.id);
                  return (
                    <button
                      key={scene.id}
                      type="button"
                      draggable={false}
                      data-left-scene-index={index}
                      onDragStart={(event) => event.preventDefault()}
                      {...scenePointerHandlers}
                      onClick={(event) => {
                        if (shouldSuppressSceneClick()) {
                          event.preventDefault();
                          event.stopPropagation();
                          return;
                        }
                        setSceneContextMenu(null);
                        onSceneSelect(scene.id);
                        jumpToSceneStart(scene.startFrame);
                      }}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onSceneSelect(scene.id);
                        setSceneContextMenu({
                          x: event.clientX,
                          y: event.clientY,
                          sceneId: scene.id,
                        });
                      }}
                      style={{
                        width: '100%',
                        minWidth: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        textAlign: 'left',
                        padding: '10px 8px',
                        borderRadius: 6,
                        border: `1px solid ${active ? '#60a5fa' : '#363636'}`,
                        background: active
                          ? 'linear-gradient(145deg, #3b82f6, #2563eb)'
                          : '#252525',
                        color: '#e5edf7',
                        boxShadow: active ? '0 2px 8px rgba(37,99,235,.22)' : 'none',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        opacity: isDragging ? 0.5 : 1,
                        position: 'relative',
                        touchAction: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',

                        outline: 'none',
                      }}
                    >
                      {showDropBefore && (
                        <span
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            left: 3,
                            right: 3,
                            height: 3,
                            borderRadius: 4,
                            background: '#60a5fa',
                            boxShadow:
                              '0 0 0 1px rgba(96,165,250,.25), 0 0 12px rgba(59,130,246,.7)',
                            top: -3,
                            zIndex: 5,
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                      {showDropAfter && (
                        <span
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            left: 3,
                            right: 3,
                            height: 3,
                            borderRadius: 4,
                            background: '#60a5fa',
                            boxShadow:
                              '0 0 0 1px rgba(96,165,250,.25), 0 0 12px rgba(59,130,246,.7)',
                            bottom: -3,
                            zIndex: 5,
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                      <span
                        aria-hidden="true"
                        style={{
                          color: active ? '#ffffff' : '#9ca3af',
                          cursor: 'grab',
                          fontSize: 15,
                        }}
                      >
                        ⠿
                      </span>
                      <span
                        style={{
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: 12,
                        }}
                      >
                        {scene.name ||
                          `${language === 'en' ? 'Scene' : language === 'es' ? 'Escena' : language === 'zh' ? '场景' : language === 'hi' ? 'दृश्य' : language === 'it' ? 'Scena' : 'Сцена'} ${index + 1}`}
                      </span>
                      <span
                        style={{
                          color: active ? '#dbeafe' : '#9ca3af',
                          fontSize: 10,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {Math.max(0, scene.durationFrames / 30).toFixed(1)}
                        {uiText(language, 'seconds')}
                      </span>
                    </button>
                  );
                })}
                {scenes.length === 0 && (
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>{panelText.noScenes}</div>
                )}
              </div>
              {sceneContextMenu && (
                <div
                  onClick={(event) => event.stopPropagation()}
                  style={{
                    position: 'fixed',
                    left: Math.min(sceneContextMenu.x, window.innerWidth - 190),
                    top: Math.min(
                      sceneContextMenu.y,
                      window.innerHeight - (sceneContextMenu.sceneId ? 112 : 56),
                    ),
                    zIndex: 10000,
                    width: 178,
                    padding: 5,
                    border: '1px solid #3a414c',
                    borderRadius: 8,
                    background: '#1c212a',
                    boxShadow: '0 10px 30px #0008',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  {sceneContextMenu.sceneId ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onSceneDuplicate(sceneContextMenu.sceneId!);
                          setSceneContextMenu(null);
                        }}
                        style={{
                          padding: '8px 10px',
                          border: 0,
                          borderRadius: 5,
                          background: 'transparent',
                          color: '#e5edf7',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: 12,
                        }}
                      >{`⧉ ${panelText.duplicateScene}`}</button>
                      <button
                        type="button"
                        disabled={scenes.length <= 1}
                        onClick={() => {
                          onSceneDelete(sceneContextMenu.sceneId!);
                          setSceneContextMenu(null);
                        }}
                        style={{
                          padding: '8px 10px',
                          border: 0,
                          borderRadius: 5,
                          background: 'transparent',
                          color: scenes.length <= 1 ? '#777' : '#fca5a5',
                          textAlign: 'left',
                          cursor: scenes.length <= 1 ? 'not-allowed' : 'pointer',
                          fontSize: 12,
                        }}
                      >{`− ${panelText.deleteScene}`}</button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSceneAdd();
                        setSceneContextMenu(null);
                      }}
                      style={{
                        padding: '8px 10px',
                        border: 0,
                        borderRadius: 5,
                        background: 'transparent',
                        color: '#e5edf7',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >{`＋ ${panelText.createScene}`}</button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                padding: 12,
                boxSizing: 'border-box',
                background: '#202020',
                color: '#e5e7eb',
                borderRadius: '0 8px 8px 0',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                {panelText.tools}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '8px 0 10px',
                  marginBottom: 8,
                  borderBottom: '1px solid #363636',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: '#d7deea' }}>{panelText.toolsQuick}</div>
                  <div style={{ fontSize: 11, color: '#929292', marginTop: 3 }}>
                    {quickAccessEnabled ? panelText.toolsOn : panelText.toolsOff}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={quickAccessEnabled}
                  aria-label={uiText(language, 'quickAccess')}
                  title={quickAccessEnabled ? panelText.disableQuick : panelText.enableQuick}
                  onClick={() => {
                    const next = !quickAccessEnabled;
                    setQuickAccessEnabled(next);
                    window.dispatchEvent(
                      new CustomEvent('editor-quick-access-change', { detail: next }),
                    );
                  }}
                  style={{
                    width: 38,
                    height: 22,
                    flex: '0 0 38px',
                    padding: 2,
                    border: '1px solid #555',
                    borderRadius: 999,
                    background: quickAccessEnabled ? '#6b7280' : '#252525',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: quickAccessEnabled ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      boxShadow: '0 1px 3px #0006',
                    }}
                  />
                </button>
              </div>
              <button
                type="button"
                aria-pressed={bladeActiveUi}
                title={
                  bladeActiveUi ? uiText(language, 'scissorsOff') : uiText(language, 'scissorsOn')
                }
                onClick={() => window.dispatchEvent(new CustomEvent('editor-blade-toggle'))}
                style={{
                  width: '100%',
                  minHeight: 38,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '8px 10px',
                  borderRadius: 4,
                  border: bladeActiveUi ? '1px dashed #f87171' : '1px solid #344256',
                  background: bladeActiveUi ? 'rgba(127,29,29,0.35)' : '#1b2533',
                  color: bladeActiveUi ? '#fecaca' : '#d7deea',
                  boxShadow: bladeActiveUi ? '0 0 0 1px rgba(248,113,113,.12)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 12,
                }}
              >
                <span style={{ fontSize: 17 }}>✂</span>
                <span>{panelText.scissors}</span>
                <span
                  style={{
                    marginLeft: 'auto',
                    color: bladeActiveUi ? '#fca5a5' : '#8491a4',
                    fontSize: 10,
                  }}
                >
                  {bladeActiveUi
                    ? (
                        {
                          ru: 'ВКЛ',
                          en: 'ON',
                          es: 'ACT',
                          zh: '开',
                          hi: 'चालू',
                          it: 'ON',
                        } as Record<string, string>
                      )[language]
                    : 'B'}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      <div
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={finishResize}
        onPointerCancel={finishResize}
        style={{
          flex: leftPanelTab !== null ? `0 0 ${RESIZE_HANDLE_WIDTH}px` : '0 0 0px',

          width: leftPanelTab !== null ? RESIZE_HANDLE_WIDTH : 0,

          height: '100%',

          marginLeft: -1,
          marginRight: -1,

          cursor: leftPanelTab !== null ? 'col-resize' : 'default',
          pointerEvents: leftPanelTab !== null ? 'auto' : 'none',

          position: 'relative',

          zIndex: 1000,

          touchAction: 'none',

          userSelect: 'none',

          background: 'transparent',
        }}
      >
        <div
          style={{
            position: 'absolute',

            top: 0,
            bottom: 0,

            left: 3,

            width: 2,

            background: 'transparent',

            pointerEvents: 'none',
          }}
        />
      </div>

      <EditorPlayerStage
        handlePlayerRef={handlePlayerRef}
        playerInputProps={playerInputProps}
        editorDuration={editorDuration}
        activeBlocks={activeBlocks}
        selectedBlockId={selectedBlockId}
        selectedBlockIds={selectedBlockIds}
        selectBlock={selectBlock}
        handleMove={handleMove}
        handleResize={handleResize}
        handleRotate={handleRotate}
        handleResizeSelection={handleResizeSelection}
        handleRotateSelection={handleRotateSelection}
        beginInteraction={beginInteraction}
        endInteraction={endInteraction}
        onStackChildTextChange={onStackChildTextChange}
      />

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={uiText(language, 'resizeInspector')}
        onPointerDown={handleInspectorResizePointerDown}
        onPointerMove={handleInspectorResizePointerMove}
        onPointerUp={finishInspectorResize}
        onPointerCancel={finishInspectorResize}
        onLostPointerCapture={finishInspectorResize}
        style={{
          flex: '0 0 8px',
          width: 8,
          minWidth: 8,
          height: '100%',
          cursor: 'col-resize',
          touchAction: 'none',
          userSelect: 'none',
          zIndex: 20,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          boxSizing: 'border-box',
          background: 'transparent',
        }}
      >
        <div aria-hidden="true" style={{ width: 0, opacity: 0, pointerEvents: 'none' }} />
      </div>

      <div
        style={{
          flex: `0 1 ${inspectorWidth}px`,

          width: inspectorWidth,
          minWidth: MIN_INSPECTOR_WIDTH,
          maxWidth: 'min(440px, 40vw)',
          // Keep the outer inspector column within the workspace. The inner
          // panel no longer adds margins on top of this allocated width.
          flexShrink: 1,

          height: '100%',
          minHeight: 0,

          display: 'flex',
          flexDirection: 'column',

          overflow: 'hidden',

          boxSizing: 'border-box',
        }}
      >
        <EditorInspector
          {...inspectorProps}
          selectedBlock={
            inspectorProps.selectedBlock
              ? {
                  ...inspectorProps.selectedBlock,
                  // Resolve against the current visual timeline rather than a stale
                  // block snapshot, so Bar/Progress max updates immediately when a scene grows.
                  segmentDuration:
                    // Prefer the live scene duration. The selected block's segmentDuration
                    // is a resolved timeline snapshot and can lag behind scene resizing.
                    editorTimeline.segments.find(
                      (segment) => segment.id === inspectorProps.selectedBlock?.segmentId,
                    )?.durationFrames ??
                    scenes.find((scene) => scene.id === inspectorProps.selectedBlock?.segmentId)
                      ?.durationFrames ??
                    // When scene and runtime segment IDs differ, use the active scene's
                    // current duration before falling back to the stale block snapshot.
                    scenes.find((scene) => scene.id === selectedSceneId)?.durationFrames ??
                    inspectorProps.selectedBlock.segmentDuration,
                }
              : undefined
          }
          projectBackground={projectBackground ?? undefined}
          onProjectBackgroundChange={onProjectBackgroundChange}
        />
      </div>
    </div>
  );
};

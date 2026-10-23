import React, { useEffect, useRef, useState } from 'react';
import type { TTSSegment } from '../../domain/timeline/ttsTimelineTypes';
import { useI18n } from '../i18n/I18nContext';

export type SceneStripProps = {
  visible: boolean;
  segments: TTSSegment[];
  fps: number;
  selectedSceneId?: string | null;
  dropSceneId: string | null;
  onSceneSelect?: (sceneId: string) => void;
  onFrameChange: (frame: number) => void;
  onSceneAdd?: () => void;
  onSceneReorder?: (sceneId: string, targetIndex: number) => void;
  onSceneDuplicate?: (sceneId?: string) => void;
  onSceneDelete?: (sceneId?: string) => void;
  onSceneDurationChange?: (sceneId: string, durationFrames: number) => void;
};

const sceneMenuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  border: 0,
  background: 'transparent',
  color: '#e5e7eb',
  textAlign: 'left',
  padding: '4px 6px',
  borderRadius: 5,
  cursor: 'pointer',
  fontSize: 12,
};

const sceneActionButtonStyle: React.CSSProperties = {
  alignSelf: 'center',
  flex: '0 0 26px',
  width: 26,
  height: 26,
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 6,
  background: '#1b1b1b',
  color: '#e5e7eb',
  fontSize: 15,
  cursor: 'pointer',
};

export const SceneStrip: React.FC<SceneStripProps> = ({
  visible,
  segments,
  fps,
  selectedSceneId,
  dropSceneId,
  onSceneSelect,
  onFrameChange,
  onSceneAdd,
  onSceneReorder,
  onSceneDuplicate,
  onSceneDelete,
  onSceneDurationChange,
}) => {
  const { translations: t } = useI18n();
  const [scenesCollapsed, setScenesCollapsed] = useState(false);
  const [sceneContextMenu, setSceneContextMenu] = useState<{
    x: number;
    y: number;
    sceneId: string | null;
  } | null>(null);
  const [draggedSceneId, setDraggedSceneId] = useState<string | null>(null);
  const [sceneDropIndex, setSceneDropIndex] = useState<number | null>(null);
  const sceneDragRef = useRef<{
    sceneId: string;
    pointerId: number;
    startX: number;
    dragging: boolean;
    targetIndex: number | null;
  } | null>(null);
  const suppressSceneClickRef = useRef(false);

  useEffect(() => {
    if (!sceneContextMenu) return;
    const close = () => setSceneContextMenu(null);
    window.addEventListener('click', close);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('resize', close);
    };
  }, [sceneContextMenu]);

  return (
    <>
      {visible && (
        <div
          onContextMenu={(event) => {
            // Route context-menu events from the scene strip to the scene-specific menu.
            // Prevent the event from reaching the editor-level context menu.
            event.preventDefault();
            event.stopPropagation();
            setSceneContextMenu({ x: event.clientX, y: event.clientY, sceneId: null });
          }}
          style={{
            flex: '0 0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: '3px 6px',
            background: '#111111',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 26,
            }}
          >
            <button
              type="button"
              onClick={() => setScenesCollapsed((value) => !value)}
              title={scenesCollapsed ? t.timeline.expandScenes : t.timeline.collapseScenes}
              style={{
                border: 0,
                background: 'transparent',
                color: '#d1d5db',
                cursor: 'pointer',
                padding: '1px 2px',
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {scenesCollapsed ? `▶ ${t.timeline.scenes}` : `▼ ${t.timeline.scenes}`}
            </button>
            {!scenesCollapsed && (
              <div style={{ display: 'flex', gap: 3 }}>
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => onSceneAdd?.()}
                  title={t.timeline.addScene}
                  style={sceneActionButtonStyle}
                >
                  +
                </button>
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => onSceneDuplicate?.()}
                  title={t.timeline.duplicateScene}
                  style={sceneActionButtonStyle}
                >
                  ⧉
                </button>
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => onSceneDelete?.()}
                  title={t.timeline.deleteScene}
                  style={sceneActionButtonStyle}
                >
                  −
                </button>
              </div>
            )}
          </div>
          {!scenesCollapsed && (
            <div
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setSceneContextMenu({ x: event.clientX, y: event.clientY, sceneId: null });
              }}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: 6,
                overflowX: 'auto',
                boxSizing: 'border-box',
                minHeight: 44,
              }}
            >
              {segments.map((segment, index) => {
                const isSelected = segment.id === selectedSceneId;
                const seconds = segment.durationFrames / fps;
                return (
                  <div
                    key={segment.id}
                    role="button"
                    tabIndex={0}
                    draggable={false}
                    onDragStart={(event) => {
                      // Scene reordering is pointer-driven. Never allow the browser's
                      // native HTML drag operation to start (it shows the red
                      // forbidden/no-drop cursor over nearby timeline regions).
                      event.preventDefault();
                    }}
                    onPointerDown={(event) => {
                      if (
                        event.button !== 0 ||
                        (event.target as HTMLElement).closest('input,button')
                      )
                        return;
                      event.preventDefault();
                      event.stopPropagation();
                      sceneDragRef.current = {
                        sceneId: segment.id,
                        pointerId: event.pointerId,
                        startX: event.clientX,
                        dragging: false,
                        targetIndex: null,
                      };
                      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={(event) => {
                      const drag = sceneDragRef.current;
                      if (!drag || drag.pointerId !== event.pointerId) return;

                      if (!drag.dragging && Math.abs(event.clientX - drag.startX) < 5) return;
                      if (!drag.dragging) {
                        drag.dragging = true;
                        suppressSceneClickRef.current = true;
                        setDraggedSceneId(drag.sceneId);
                      }

                      // Resolve insertion position against every scene card, not only
                      // elementFromPoint's hit target. This also supports the empty
                      // space before the first card and after the last card.
                      const cards = Array.from(
                        document.querySelectorAll<HTMLElement>('[data-scene-index]'),
                      ).filter((card) => card.offsetWidth > 0 && card.offsetHeight > 0);
                      if (cards.length === 0) return;
                      let rawTargetIndex = cards.length;
                      for (let cardIndex = 0; cardIndex < cards.length; cardIndex += 1) {
                        const rect = cards[cardIndex].getBoundingClientRect();
                        if (event.clientX < rect.left + rect.width / 2) {
                          rawTargetIndex = Number(cards[cardIndex].dataset.sceneIndex);
                          break;
                        }
                      }
                      if (!Number.isFinite(rawTargetIndex)) return;
                      const sourceIndex = segments.findIndex((item) => item.id === drag.sceneId);
                      // The controller expects the final index after removal.
                      const targetIndex =
                        sourceIndex >= 0 && sourceIndex < rawTargetIndex
                          ? rawTargetIndex - 1
                          : rawTargetIndex;
                      drag.targetIndex = Math.max(0, Math.min(segments.length - 1, targetIndex));
                      setSceneDropIndex(rawTargetIndex);
                    }}
                    onPointerUp={(event) => {
                      const drag = sceneDragRef.current;
                      if (!drag || drag.pointerId !== event.pointerId) return;
                      if (drag.dragging && drag.targetIndex !== null) {
                        onSceneReorder?.(drag.sceneId, drag.targetIndex);
                      }
                      sceneDragRef.current = null;
                      setDraggedSceneId(null);
                      setSceneDropIndex(null);
                      if (drag.dragging) {
                        window.setTimeout(() => {
                          suppressSceneClickRef.current = false;
                        }, 0);
                      }
                    }}
                    onPointerCancel={() => {
                      sceneDragRef.current = null;
                      setDraggedSceneId(null);
                      setSceneDropIndex(null);
                      suppressSceneClickRef.current = false;
                    }}
                    onClick={(event) => {
                      if (suppressSceneClickRef.current) {
                        event.preventDefault();
                        event.stopPropagation();
                        return;
                      }
                      onSceneSelect?.(segment.id);
                      onFrameChange(segment.startFrame);
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onSceneSelect?.(segment.id);
                      setSceneContextMenu({
                        x: event.clientX,
                        y: event.clientY,
                        sceneId: segment.id,
                      });
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSceneSelect?.(segment.id);
                        onFrameChange(segment.startFrame);
                      }
                    }}
                    data-scene-index={index}
                    data-block-drop-target={dropSceneId === segment.id ? 'true' : undefined}
                    style={{
                      position: 'relative',
                      flex: '0 0 150px',
                      height: 44,
                      border: isSelected ? '1px solid #9ca3af' : '1px solid #454545',
                      borderRadius: 6,
                      background:
                        dropSceneId === segment.id ? '#3f5142' : isSelected ? '#555555' : '#303030',
                      color: '#e5e7eb',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      cursor: draggedSceneId === segment.id ? 'grabbing' : 'grab',
                      opacity: draggedSceneId === segment.id ? 0.55 : 1,
                      borderColor: dropSceneId === segment.id ? 'rgba(74,222,128,0.95)' : undefined,
                      boxShadow:
                        dropSceneId === segment.id
                          ? 'inset 0 0 0 1px rgba(134,239,172,0.22)'
                          : sceneDropIndex === index
                            ? 'inset 3px 0 0 rgba(255,255,255,0.8)'
                            : sceneDropIndex === index + 1
                              ? 'inset -3px 0 0 rgba(255,255,255,0.8)'
                              : isSelected
                                ? 'inset 0 1px 0 rgba(255,255,255,0.10)'
                                : undefined,
                      padding: '4px 6px',
                      textAlign: 'left',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 650,
                        letterSpacing: '0.01em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        paddingRight: 66,
                      }}
                    >
                      {segment.name || `${t.timeline.scene} ${index + 1}`}
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        right: 5,
                        bottom: 4,
                        width: 64,
                        height: 20,
                      }}
                      onClick={(event) => event.stopPropagation()}
                      onPointerDown={(event) => event.stopPropagation()}
                    >
                      <input
                        aria-label={`${t.inspector.duration} ${segment.name || `${t.timeline.scene.toLowerCase()} ${index + 1}`}`}
                        type="text"
                        inputMode="decimal"
                        value={seconds.toFixed(1)}
                        onChange={(event) => {
                          const value = Number(event.currentTarget.value.replace(',', '.'));
                          if (!Number.isFinite(value)) return;
                          onSceneDurationChange?.(segment.id, Math.max(0.5, value) * fps);
                        }}
                        onKeyDown={(event) => {
                          event.stopPropagation();
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: '1px solid rgba(255,255,255,0.14)',
                          borderRadius: 5,
                          background: '#111111',
                          color: '#f3f4f6',
                          padding: '0 22px 0 6px',
                          textAlign: 'left',
                          fontSize: 11,
                          fontVariantNumeric: 'tabular-nums',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          right: 1,
                          top: 1,
                          bottom: 1,
                          width: 18,
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          borderLeft: '1px solid rgba(255,255,255,0.10)',
                          borderRadius: '0 4px 4px 0',
                          background: '#191919',
                        }}
                      >
                        <button
                          type="button"
                          aria-label={t.timeline.increaseDuration}
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            const target = event.currentTarget;
                            let currentSeconds = seconds;
                            const step = () => {
                              currentSeconds = Math.max(0.5, currentSeconds + 0.1);
                              onSceneDurationChange?.(segment.id, currentSeconds * fps);
                            };
                            step();
                            const timeout = window.setTimeout(() => {
                              const interval = window.setInterval(step, 70);
                              target.dataset.durationRepeatInterval = String(interval);
                            }, 350);
                            target.dataset.durationRepeatTimeout = String(timeout);
                            target.setPointerCapture?.(event.pointerId);
                          }}
                          onPointerUp={(event) => {
                            event.stopPropagation();
                            const target = event.currentTarget;
                            const timeout = Number(target.dataset.durationRepeatTimeout);
                            const interval = Number(target.dataset.durationRepeatInterval);
                            if (timeout) window.clearTimeout(timeout);
                            if (interval) window.clearInterval(interval);
                            delete target.dataset.durationRepeatTimeout;
                            delete target.dataset.durationRepeatInterval;
                          }}
                          onPointerCancel={(event) => {
                            const target = event.currentTarget;
                            const timeout = Number(target.dataset.durationRepeatTimeout);
                            const interval = Number(target.dataset.durationRepeatInterval);
                            if (timeout) window.clearTimeout(timeout);
                            if (interval) window.clearInterval(interval);
                            delete target.dataset.durationRepeatTimeout;
                            delete target.dataset.durationRepeatInterval;
                          }}
                          onClick={(event) => event.stopPropagation()}
                          style={{
                            flex: 1,
                            minHeight: 0,
                            padding: 0,
                            border: 0,
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            background: 'transparent',
                            color: '#aeb6c2',
                            fontSize: 8,
                            lineHeight: 1,
                            cursor: 'pointer',
                          }}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          aria-label={t.timeline.decreaseDuration}
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            const target = event.currentTarget;
                            let currentSeconds = seconds;
                            const step = () => {
                              currentSeconds = Math.max(0.5, currentSeconds - 0.1);
                              onSceneDurationChange?.(segment.id, currentSeconds * fps);
                            };
                            step();
                            const timeout = window.setTimeout(() => {
                              const interval = window.setInterval(step, 70);
                              target.dataset.durationRepeatInterval = String(interval);
                            }, 350);
                            target.dataset.durationRepeatTimeout = String(timeout);
                            target.setPointerCapture?.(event.pointerId);
                          }}
                          onPointerUp={(event) => {
                            event.stopPropagation();
                            const target = event.currentTarget;
                            const timeout = Number(target.dataset.durationRepeatTimeout);
                            const interval = Number(target.dataset.durationRepeatInterval);
                            if (timeout) window.clearTimeout(timeout);
                            if (interval) window.clearInterval(interval);
                            delete target.dataset.durationRepeatTimeout;
                            delete target.dataset.durationRepeatInterval;
                          }}
                          onPointerCancel={(event) => {
                            const target = event.currentTarget;
                            const timeout = Number(target.dataset.durationRepeatTimeout);
                            const interval = Number(target.dataset.durationRepeatInterval);
                            if (timeout) window.clearTimeout(timeout);
                            if (interval) window.clearInterval(interval);
                            delete target.dataset.durationRepeatTimeout;
                            delete target.dataset.durationRepeatInterval;
                          }}
                          onClick={(event) => event.stopPropagation()}
                          style={{
                            flex: 1,
                            minHeight: 0,
                            padding: 0,
                            border: 0,
                            background: 'transparent',
                            color: '#aeb6c2',
                            fontSize: 8,
                            lineHeight: 1,
                            cursor: 'pointer',
                          }}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {sceneContextMenu && (
        <div
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
          style={{
            position: 'fixed',
            left: sceneContextMenu.x,
            top: sceneContextMenu.y,
            zIndex: 100000,
            minWidth: 190,
            padding: 4,
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: 8,
            background: '#1b1b1b',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            pointerEvents: 'auto',
          }}
        >
          {sceneContextMenu.sceneId ? (
            <>
              <button
                type="button"
                onClick={() => {
                  const id = sceneContextMenu.sceneId;
                  setSceneContextMenu(null);
                  onSceneDuplicate?.(id ?? undefined);
                }}
                style={sceneMenuItemStyle}
              >
                {t.timeline.duplicateScene}
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = sceneContextMenu.sceneId;
                  setSceneContextMenu(null);
                  onSceneDelete?.(id ?? undefined);
                }}
                style={{ ...sceneMenuItemStyle, color: '#f87171' }}
              >
                {t.timeline.deleteScene}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSceneContextMenu(null);
                onSceneAdd?.();
              }}
              style={sceneMenuItemStyle}
            >
              {t.timeline.addScene}
            </button>
          )}
        </div>
      )}
    </>
  );
};

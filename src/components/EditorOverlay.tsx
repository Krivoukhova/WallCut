import React, { useEffect, useRef, useState } from 'react';

import type { ResolvedBlock } from '../domain/resolution/blockResolver';
import {
  COMPOSITION_HEIGHT,
  COMPOSITION_WIDTH,
  getScaleX,
  getScaleY,
} from '../editor/overlay/overlayGeometry';
import type { EditorBlock, ResizeHandle } from '../editor/overlay/overlayTypes';
import { useOverlayInteraction } from '../editor/overlay/useOverlayInteraction';
import { useI18n } from '../editor/i18n/I18nContext';
import { uiText } from '../domain/i18n/uiText';

export type EditorOverlayProps = {
  blocks: (ResolvedBlock & { editorId?: string })[];
  selectedId: string | null;
  selectedIds?: string[];
  onSelect: (id: string, additive?: boolean) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, scaleX: number, scaleY: number) => void;
  onRotate: (id: string, rotation: number) => void;
  onResizeSelection?: (
    updates: Array<{ id: string; scaleX: number; scaleY: number; x: number; y: number }>,
  ) => void;
  onRotateSelection?: (
    updates: Array<{ id: string; rotation: number; x: number; y: number }>,
  ) => void;
  onInteractionStart: () => void;
  onInteractionEnd: () => void;
  onStackChildTextChange?: (stackId: string, childId: string, text: string) => void;
};

const HANDLE_POSITIONS: Record<ResizeHandle, React.CSSProperties> = {
  nw: { left: -8, top: -8 },
  n: { left: '50%', top: -8, transform: 'translateX(-50%)' },
  ne: { right: -8, top: -8 },
  e: { right: -8, top: '50%', transform: 'translateY(-50%)' },
  se: { right: -8, bottom: -8 },
  s: { left: '50%', bottom: -8, transform: 'translateX(-50%)' },
  sw: { left: -8, bottom: -8 },
  w: { left: -8, top: '50%', transform: 'translateY(-50%)' },
};

const HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

function getCursor(handle: ResizeHandle) {
  if (handle === 'nw' || handle === 'se') return 'nwse-resize';
  if (handle === 'ne' || handle === 'sw') return 'nesw-resize';
  if (handle === 'n' || handle === 's') return 'ns-resize';
  if (handle === 'e' || handle === 'w') return 'ew-resize';
  return 'default';
}

type OverlayBlockProps = {
  block: ResolvedBlock & { editorId?: string };
  selected: boolean;
  transformActive: boolean;
  dragging: boolean;
  onSelect: (id: string, additive?: boolean) => void;
  startMove: (event: React.PointerEvent, block: EditorBlock) => void;
  startResize: (event: React.PointerEvent, block: EditorBlock, handle: ResizeHandle) => void;
  startRotate: (event: React.PointerEvent, block: EditorBlock) => void;
  onStackChildTextChange?: (stackId: string, childId: string, text: string) => void;
};

const OverlayBlock = React.memo<OverlayBlockProps>(function OverlayBlock({
  block,
  selected,
  transformActive,
  dragging,
  onSelect,
  startMove,
  startResize,
  startRotate,
  onStackChildTextChange,
}) {
  const { language } = useI18n();
  const id = block.editorId ?? block.id;
  const nestingDepth = Math.max(0, id.split('/').length - 1);
  const scaleX = getScaleX(block);
  const scaleY = getScaleY(block);
  // The selection frame uses the same effective width/height as the rendered
  // object, so the frame and its handles share one coordinate system. Scale is
  // reflected in the frame dimensions rather than inherited by the handles.
  // The overlay stays outside Remotion <Player> and never calls Remotion hooks.
  const effectiveScaleX = Math.max(0.001, Math.abs(block.scale * scaleX));
  const effectiveScaleY = Math.max(0.001, Math.abs(block.scale * scaleY));
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  return (
    <>
      <style>{`.stack-child-text-input::placeholder { color: rgba(255,255,255,0.38); opacity: 1; }`}</style>
      <div
        data-editor-overlay-block="true"
        data-editor-id={id}
        draggable={false}
        onDragStart={(event) => {
          // The overlay implements its own pointer-based dragging. Prevent the
          // browser's native HTML drag image/copy cursor from starting instead.
          event.preventDefault();
        }}
        onPointerDown={(event) => {
          // Prevent native image/text dragging; movement is handled by the editor.
          event.preventDefault();
          event.stopPropagation();
          pointerStartRef.current = {
            x: event.clientX,
            y: event.clientY,
          };

          const additive = event.shiftKey || event.metaKey || event.ctrlKey;

          // A normal click on an unselected block selects only that block.
          // A modifier click keeps the existing additive/toggle behaviour.
          // If the block is already selected, do not change the selection yet:
          // we need to distinguish a click (single-select) from a drag (group drag).
          if (!selected || additive) {
            onSelect(id, additive);
          }

          startMove(event, block);
        }}
        onPointerUp={(event) => {
          const additive = event.shiftKey || event.metaKey || event.ctrlKey;
          const start = pointerStartRef.current;
          const distance = start ? Math.hypot(event.clientX - start.x, event.clientY - start.y) : 0;
          const wasClick = distance <= 4;

          // A real drag must never change the selection. A simple click on an
          // already-selected block intentionally collapses the selection to it.
          // Determine this from the actual pointer displacement at pointerup so
          // the first drag is not accidentally treated as a click.
          if (wasClick && selected && !additive) {
            onSelect(id, false);
          }

          pointerStartRef.current = null;
        }}
        onPointerCancel={() => {
          pointerStartRef.current = null;
        }}
        style={{
          position: 'absolute',
          left: `${(block.x / COMPOSITION_WIDTH) * 100}%`,
          top: `${(block.y / COMPOSITION_HEIGHT) * 100}%`,
          width: `${((block.width * effectiveScaleX) / COMPOSITION_WIDTH) * 100}%`,
          height: `${((block.height * effectiveScaleY) / COMPOSITION_HEIGHT) * 100}%`,
          boxSizing: 'border-box',
          pointerEvents: 'auto',
          cursor: dragging ? 'grabbing' : 'grab',
          border: selected ? '2px solid #4da3ff' : '1px solid rgba(77,163,255,0.35)',
          background: 'transparent',
          transform: `translate(-50%, -50%) rotate(${block.rotation}deg)`,
          transformOrigin: 'center center',
          // Nested children must stay above their parent Group's transparent
          // hit area. Otherwise a selected Group captures the pointer and a
          // child cannot be dragged back across the Group boundary.
          zIndex: 10 + nestingDepth * 30 + (selected ? 40 : 0),
        }}
      >
        {selected && block.block.type === 'stack' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: block.block.padding ?? 0,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: block.block.direction === 'horizontal' ? 'row' : 'column',
              gap: block.block.gap ?? 0,
              alignItems: 'stretch',
              pointerEvents: 'none',
              overflow: 'hidden',
              zIndex: 120,
            }}
          >
            {(block.block.children ?? []).map((child, index) => {
              const childId = child.id ?? `${child.type}-${index}`;
              const childEditorId = `${id}/${childId}`;
              const rowStyle: React.CSSProperties = {
                flex: block.block.direction === 'horizontal' ? '1 1 0' : '1 1 0',
                minWidth: 0,
                minHeight: 48,
                boxSizing: 'border-box',
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
              };

              if (child.type === 'text') {
                return (
                  <div
                    key={childEditorId}
                    style={{
                      ...rowStyle,
                      position: 'relative',
                      pointerEvents: 'none',
                    }}
                  >
                    <input
                      className="stack-child-text-input"
                      value={child.text ?? ''}
                      placeholder={uiText(language, 'enterText')}
                      onChange={(event) =>
                        onStackChildTextChange?.(block.id, childId, event.target.value)
                      }
                      onPointerDown={(event) => event.stopPropagation()}
                      onFocus={() => undefined}
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                      onKeyDown={(event) => event.stopPropagation()}
                      style={{
                        width: '100%',
                        height: '100%',
                        minWidth: 0,
                        minHeight: 0,
                        boxSizing: 'border-box',
                        padding: '6px 10px',
                        border: 'none',
                        borderRadius: 0,
                        background: 'transparent',
                        color: 'transparent',
                        caretColor: child.color ?? '#fff',
                        WebkitTextFillColor: 'transparent',
                        fontSize: 14,
                        fontWeight: child.fontWeight ?? 600,
                        textAlign: 'center',
                        outline: 'none',
                        // Text children are selectable only from the Inspector.
                        // Keep the editor overlay input non-interactive so clicks on
                        // the rendered text always belong to the parent Stack.
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                );
              }
              return (
                <button
                  key={childEditorId}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(childEditorId);
                  }}
                  style={{
                    ...rowStyle,
                    pointerEvents: 'auto',
                    border: 'none',
                    borderRadius: 0,
                    background: 'transparent',
                    color: 'transparent',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <span aria-hidden="true" style={{ width: '100%', height: '100%' }} />
                </button>
              );
            })}
          </div>
        )}

        {transformActive && (
          <>
            {HANDLES.map((handle) => (
              <div
                key={handle}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  startResize(event, block, handle);
                }}
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  boxSizing: 'border-box',
                  background: '#ffffff',
                  border: '1px solid #222',
                  borderRadius: 2,
                  cursor: getCursor(handle),
                  zIndex: 100,
                  ...HANDLE_POSITIONS[handle],
                  transform: HANDLE_POSITIONS[handle].transform ?? 'none',
                }}
              />
            ))}
            <div
              onPointerDown={(event) => {
                event.stopPropagation();
                startRotate(event, block);
              }}
              style={{
                position: 'absolute',
                left: '50%',
                top: -34,
                pointerEvents: 'auto',
                width: 12,
                height: 12,
                transform: 'translateX(-50%)',
                borderRadius: '50%',
                background: '#4da3ff',
                border: '2px solid white',
                boxSizing: 'border-box',
                cursor: 'crosshair',
                zIndex: 110,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: -22,
                width: 1,
                height: 22,
                transform: 'translateX(-50%)',
                background: '#4da3ff',
                pointerEvents: 'none',
              }}
            />
          </>
        )}
      </div>
    </>
  );
});

OverlayBlock.displayName = 'OverlayBlock';

function SnapGuides({
  blocks,
  draggingId,
  selectedIds,
}: {
  blocks: EditorBlock[];
  draggingId: string | null;
  selectedIds: string[];
}) {
  const [guides, setGuides] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  useEffect(() => {
    const onMove = () => {
      if (!draggingId) {
        setGuides({ x: null, y: null });
        return;
      }

      const player = document.querySelector('[data-editor-player]') as HTMLElement | null;
      if (!player) return;

      const ids = selectedIds.includes(draggingId) ? selectedIds : [draggingId];
      const selected = blocks.filter((b) => ids.includes(b.editorId ?? b.id));
      if (!selected.length) {
        setGuides({ x: null, y: null });
        return;
      }

      const getGeometry = (block: EditorBlock) => {
        const width = block.width * block.scale * (block.scaleX ?? 1);
        const height = block.height * block.scale * (block.scaleY ?? 1);
        const cx = block.x ?? COMPOSITION_WIDTH / 2;
        const cy = block.y ?? COMPOSITION_HEIGHT / 2;
        return {
          cx,
          cy,
          left: cx - width / 2,
          right: cx + width / 2,
          top: cy - height / 2,
          bottom: cy + height / 2,
        };
      };

      const group = selected.reduce(
        (acc, block) => {
          const g = getGeometry(block);
          return {
            left: Math.min(acc.left, g.left),
            right: Math.max(acc.right, g.right),
            top: Math.min(acc.top, g.top),
            bottom: Math.max(acc.bottom, g.bottom),
          };
        },
        { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity },
      );

      const centerX = (group.left + group.right) / 2;
      const centerY = (group.top + group.bottom) / 2;
      const threshold = 24;

      // Only the two canvas center guides are shown.
      // They activate from the selection center, never from the pointer.
      const centerTargetX = COMPOSITION_WIDTH / 2;
      const centerTargetY = COMPOSITION_HEIGHT / 2;
      const activeX = Math.abs(centerX - centerTargetX) <= threshold ? centerTargetX : null;
      const activeY = Math.abs(centerY - centerTargetY) <= threshold ? centerTargetY : null;

      setGuides({ x: activeX, y: activeY });
    };

    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [blocks, draggingId, selectedIds]);

  if (!draggingId || (guides.x === null && guides.y === null)) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
      {guides.x !== null && (
        <div
          style={{
            position: 'absolute',
            left: `${(guides.x / COMPOSITION_WIDTH) * 100}%`,
            top: 0,
            bottom: 0,
            width: 1,
            background: 'rgba(0, 180, 255, 0.9)',
          }}
        />
      )}
      {guides.y !== null && (
        <div
          style={{
            position: 'absolute',
            top: `${(guides.y / COMPOSITION_HEIGHT) * 100}%`,
            left: 0,
            right: 0,
            height: 1,
            background: 'rgba(0, 180, 255, 0.9)',
          }}
        />
      )}
    </div>
  );
}

const EditorOverlayComponent: React.FC<EditorOverlayProps> = ({
  blocks,
  selectedId,
  selectedIds = [],
  onSelect,
  onMove,
  onResize,
  onRotate,
  onResizeSelection,
  onRotateSelection,
  onInteractionStart,
  onInteractionEnd,
  onStackChildTextChange,
}) => {
  const { draggingId, startMove, startResize, startRotate } = useOverlayInteraction({
    onMove,
    onResize,
    onRotate,
    onResizeSelection,
    onRotateSelection,
    onInteractionStart,
    onInteractionEnd,
    selectedIds,
    blocks,
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <SnapGuides blocks={blocks} draggingId={draggingId} selectedIds={selectedIds} />
      {blocks.map((block) => {
        const id = block.editorId ?? block.id;
        /*
         * Keep the React node stable while a block is being
         * reparented into a Group. The editorId changes from
         * `segment:block` to `segment:group/block`, but the
         * underlying block is still the same DOM drag target.
         * Using editorId as the key remounts the node during
         * pointer capture and produces the ghost/second-drag
         * behaviour after dropping into a Group.
         */
        const stableKey = block.id;

        return (
          <OverlayBlock
            key={stableKey}
            block={block}
            selected={selectedIds.includes(id) || selectedId === id}
            transformActive={selectedIds.includes(id) || selectedId === id}
            dragging={draggingId === id}
            onSelect={onSelect}
            startMove={startMove}
            startResize={startResize}
            startRotate={startRotate}
            onStackChildTextChange={onStackChildTextChange}
          />
        );
      })}
    </div>
  );
};

export const EditorOverlay = React.memo(EditorOverlayComponent);
EditorOverlay.displayName = 'EditorOverlay';

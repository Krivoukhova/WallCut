import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import type { TTSSegment } from '../../domain/timeline/ttsTimelineTypes';

type SceneDragState = {
  sceneId: string;
  pointerId: number;
  startY: number;
  dragging: boolean;
  targetIndex: number | null;
};

type ScenePointerHandlers = {
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: () => void;
};

/** Keeps scene drag state and pointer handling out of the workspace layout. */
export function useSceneReordering(
  scenes: TTSSegment[],
  onSceneReorder: (sceneId: string, targetIndex: number) => void,
) {
  const [draggedSceneId, setDraggedSceneId] = useState<string | null>(null);
  const [sceneDropIndex, setSceneDropIndex] = useState<number | null>(null);
  const sceneDragRef = useRef<SceneDragState | null>(null);
  const suppressSceneClickRef = useRef(false);

  const resetDrag = useCallback(() => {
    sceneDragRef.current = null;
    setDraggedSceneId(null);
    setSceneDropIndex(null);
  }, []);

  const getScenePointerHandlers = useCallback(
    (sceneId: string): ScenePointerHandlers => {
      const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0 || (event.target as HTMLElement).closest('input')) return;
        event.preventDefault();
        event.stopPropagation();
        sceneDragRef.current = {
          sceneId,
          pointerId: event.pointerId,
          startY: event.clientY,
          dragging: false,
          targetIndex: null,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      };

      const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
        const drag = sceneDragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        if (!drag.dragging && Math.abs(event.clientY - drag.startY) < 5) return;
        if (!drag.dragging) {
          drag.dragging = true;
          suppressSceneClickRef.current = true;
          setDraggedSceneId(drag.sceneId);
        }

        const cards = Array.from(
          document.querySelectorAll<HTMLElement>('[data-left-scene-index]'),
        ).filter((card) => card.offsetWidth > 0 && card.offsetHeight > 0);
        if (!cards.length) return;

        let insertAt = cards.length;
        for (const card of cards) {
          const rect = card.getBoundingClientRect();
          if (event.clientY < rect.top + rect.height / 2) {
            insertAt = Number(card.dataset.leftSceneIndex);
            break;
          }
        }

        const sourceIndex = scenes.findIndex((item) => item.id === drag.sceneId);
        if (sourceIndex < 0 || !Number.isFinite(insertAt)) return;
        drag.targetIndex = Math.max(
          0,
          Math.min(scenes.length - 1, insertAt - (sourceIndex < insertAt ? 1 : 0)),
        );
        setSceneDropIndex(insertAt);
      };

      const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
        const drag = sceneDragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        if (drag.dragging && drag.targetIndex !== null) {
          onSceneReorder(drag.sceneId, drag.targetIndex);
        }
        resetDrag();
        if (drag.dragging) {
          window.setTimeout(() => {
            suppressSceneClickRef.current = false;
          }, 0);
        }
      };

      const onPointerCancel = () => {
        resetDrag();
        suppressSceneClickRef.current = false;
      };

      return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
    },
    [onSceneReorder, resetDrag, scenes],
  );

  const shouldSuppressSceneClick = useCallback(
    () => suppressSceneClickRef.current,
    [],
  );

  return {
    draggedSceneId,
    sceneDropIndex,
    getScenePointerHandlers,
    shouldSuppressSceneClick,
  };
}

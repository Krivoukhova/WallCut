import type { ResolvedBlock } from '../../domain/resolution/blockResolver';

export type EditorBlock = ResolvedBlock & {
  editorId?: string;
};

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export type DragMode = 'move' | 'resize' | 'rotate';

export type DragState = {
  id: string;
  mode: DragMode;
  handle?: ResizeHandle;
  startMouseX: number;
  startMouseY: number;
  startX: number;
  startY: number;
  startScale: number;
  startScaleX: number;
  startScaleY: number;
  startRotation: number;
  startWidth: number;
  startHeight: number;
  startEffectiveWidth: number;
  startEffectiveHeight: number;
  startLocalX: number;
  startLocalY: number;
  blockType?: EditorBlock['block']['type'];
  startAngle?: number;
  selectionIds?: string[];
  groupStartCenterX?: number;
  groupStartCenterY?: number;
  selectionTransformIds?: string[];
  selectionStart?: Array<{
    id: string;
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    width: number;
    height: number;
  }>;
  selectionBounds?: { left: number; right: number; top: number; bottom: number };
  selectionStartAngle?: number;
};

export type OverlayInteractionHandlers = {
  onMove: (id: string, x: number, y: number, selectionIds?: string[]) => string | void;
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
};

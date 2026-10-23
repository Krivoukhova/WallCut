import { useEffect } from 'react';

import type { ResolvedEditorBlock } from './editorTypes';

type UseEditorKeyboardOptions = {
  selectedBlock: ResolvedEditorBlock | undefined;

  selectedBlockId: string | null;

  selectedBlockIds: string[];

  hasClipboard: boolean;

  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDeleteScene?: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onMoveSelected: (dx: number, dy: number) => void;
};

export function useEditorKeyboard({
  selectedBlock,
  selectedBlockId,
  selectedBlockIds,
  hasClipboard,
  onUndo,
  onRedo,
  onSave,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onDeleteScene,
  onGroup,
  onUngroup,
  onMoveForward,
  onMoveBackward,
  onBringToFront,
  onSendToBack,
  onMoveSelected,
}: UseEditorKeyboardOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      const input = target instanceof HTMLInputElement ? target : null;

      const isColorInput = input?.type === 'color';

      const isColorTextInput = input?.type === 'text' && target.dataset.editorColor === 'true';

      const isEditable =
        !isColorInput &&
        !isColorTextInput &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      const modifier = event.ctrlKey || event.metaKey;

      if (
        !isEditable &&
        !isColorTextInput &&
        (event.key === 'Delete' || event.key === 'Backspace')
      ) {
        if (!selectedBlockId) {
          if (event.key === 'Delete' && selectedBlockIds.length === 0) {
            event.preventDefault();
            event.stopPropagation();
            onDeleteScene?.();
          }
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        onDelete();

        return;
      }

      if (
        !isEditable &&
        !isColorInput &&
        !isColorTextInput &&
        selectedBlockIds.length > 0 &&
        (event.key === 'ArrowLeft' ||
          event.key === 'ArrowRight' ||
          event.key === 'ArrowUp' ||
          event.key === 'ArrowDown')
      ) {
        const step = event.shiftKey ? 10 : 1;
        const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
        const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;

        event.preventDefault();
        event.stopPropagation();
        onMoveSelected(dx, dy);
        return;
      }

      if (!modifier) {
        return;
      }

      if (event.code === 'KeyZ') {
        if (isEditable && !isColorInput && !isColorTextInput) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (event.shiftKey) {
          onRedo();
        } else {
          onUndo();
        }

        return;
      }

      if (modifier && (event.code === 'BracketRight' || event.code === 'BracketLeft')) {
        if (isEditable || (!selectedBlockIds.length && !selectedBlock)) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const forward = event.code === 'BracketRight';
        if (event.shiftKey) {
          if (forward) {
            onBringToFront();
          } else {
            onSendToBack();
          }
        } else if (forward) {
          onMoveForward();
        } else {
          onMoveBackward();
        }

        return;
      }

      if (event.code === 'KeyG') {
        if (isEditable || (!selectedBlockIds.length && !selectedBlock)) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (event.shiftKey) {
          onUngroup();
        } else {
          onGroup();
        }

        return;
      }

      if (event.code === 'KeyY') {
        if (isEditable && !isColorInput && !isColorTextInput) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        onRedo();

        return;
      }

      if (isEditable) {
        return;
      }

      if (event.code === 'KeyS') {
        event.preventDefault();
        event.stopPropagation();

        onSave();

        return;
      }

      if (event.code === 'KeyC') {
        if (!selectedBlock) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        onCopy();

        return;
      }

      if (event.code === 'KeyV') {
        if (!hasClipboard) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        onPaste();

        return;
      }

      if (event.code === 'KeyD') {
        if (!selectedBlock) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        onDuplicate();

        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [
    selectedBlock,
    selectedBlockId,
    selectedBlockIds,
    hasClipboard,
    onUndo,
    onRedo,
    onSave,
    onCopy,
    onPaste,
    onDuplicate,
    onDelete,
    onDeleteScene,
    onGroup,
    onUngroup,
    onMoveForward,
    onMoveBackward,
    onBringToFront,
    onSendToBack,
    onMoveSelected,
  ]);
}

import type { InteractionState } from './timelineTypes';

export type InteractionRestoreCallbacks = {
  onMoveBlock: (editorId: string, startFrame: number) => unknown;
  onResizeBlock: (editorId: string, startFrame: number, duration: number) => void;
};

/** Restore the exact pre-interaction geometry when the pointer is cancelled. */
export function restoreCancelledBlockInteraction(
  interaction: Pick<
    InteractionState,
    'type' | 'editorId' | 'originalStartFrame' | 'originalDuration'
  >,
  callbacks: InteractionRestoreCallbacks,
): void {
  if (interaction.type === 'resize-left' || interaction.type === 'resize-right') {
    callbacks.onResizeBlock(
      interaction.editorId,
      interaction.originalStartFrame,
      interaction.originalDuration,
    );
    return;
  }

  callbacks.onMoveBlock(interaction.editorId, interaction.originalStartFrame);
}

/** A cancelled interaction is rollback-only and must not commit a track drop. */
export function shouldCommitTrackDrop(
  wasDragging: boolean,
  cancelled: boolean,
  interactionType: InteractionState['type'],
): boolean {
  return wasDragging && !cancelled && interactionType === 'move';
}

import type { ResolvedEditorBlock } from '../editorTypes';
import type { TTSSegment } from '../../domain/timeline/ttsTimelineTypes';

/**
 * Keeps a drag attached to the same scene-qualified block ID while React is
 * reconciling a cross-scene move. The previous snapshot is intentionally used
 * as a fallback for the render in which the old keyed block disappears.
 */
export function resolveInteractingBlock(
  blocks: ResolvedEditorBlock[],
  editorId: string,
  lastBlock: ResolvedEditorBlock,
): ResolvedEditorBlock {
  return blocks.find((item) => item.editorId === editorId) ?? lastBlock;
}

/** Builds a temporary snapshot for the destination scene before React resolves it. */
export function createTransferredBlockSnapshot(
  block: ResolvedEditorBlock,
  editorId: string,
  targetSegment: Pick<TTSSegment, 'id' | 'startFrame'>,
  absoluteStartFrame: number,
): ResolvedEditorBlock {
  return {
    ...block,
    editorId,
    segmentId: targetSegment.id,
    absoluteStartFrame,
    block: {
      ...block.block,
      id: editorId.slice(editorId.indexOf(':') + 1),
      startFrame: Math.max(0, absoluteStartFrame - targetSegment.startFrame),
    },
  };
}

/** Only accept an identity change explicitly confirmed by the move callback. */
export function resolveConfirmedMoveEditorId(
  currentEditorId: string,
  callbackResult: string | void,
): string {
  return typeof callbackResult === 'string' && callbackResult.length > 0
    ? callbackResult
    : currentEditorId;
}

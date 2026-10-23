import React from 'react';
import { Player, type PlayerRef } from '@remotion/player';

import { EditorOverlay } from '../../components/EditorOverlay';
import { PlayerComposition } from '../PlayerComposition';
import type { ResolvedEditorBlock } from '../editorTypes';
import { compileRenderModel } from '../../renderer/renderModel';

type PlayerInputProps = {
  renderModel: ReturnType<typeof compileRenderModel>;
  editorMode: boolean;
  onStackChildTextChange?: (stackId: string, childId: string, text: string) => void;
};

type EditorPlayerStageProps = {
  handlePlayerRef: (ref: PlayerRef | null) => void;
  playerInputProps: PlayerInputProps;
  editorDuration: number;
  activeBlocks: ResolvedEditorBlock[];
  selectedBlockId: string | null;
  selectedBlockIds: string[];
  selectBlock: (id: string | null, additive?: boolean) => void;
  handleMove: React.ComponentProps<typeof EditorOverlay>['onMove'];
  handleResize: React.ComponentProps<typeof EditorOverlay>['onResize'];
  handleRotate: React.ComponentProps<typeof EditorOverlay>['onRotate'];
  handleResizeSelection: React.ComponentProps<typeof EditorOverlay>['onResizeSelection'];
  handleRotateSelection: React.ComponentProps<typeof EditorOverlay>['onRotateSelection'];
  beginInteraction: () => void;
  endInteraction: () => void;
  onStackChildTextChange?: (stackId: string, childId: string, text: string) => void;
};

export const EditorPlayerStage: React.FC<EditorPlayerStageProps> = ({
  handlePlayerRef,
  playerInputProps,
  editorDuration,
  activeBlocks,
  selectedBlockId,
  selectedBlockIds,
  selectBlock,
  handleMove,
  handleResize,
  handleRotate,
  handleResizeSelection,
  handleRotateSelection,
  beginInteraction,
  endInteraction,
  onStackChildTextChange,
}) => (
  <div
    style={{
      flex: '1 1 0',
      minWidth: 0,
      minHeight: 0,
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div
      data-editor-player
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-editor-overlay-block]')) selectBlock(null);
      }}
      style={{
        position: 'relative',
        height: 'calc(100% - 24px)',
        maxHeight: '100%',
        aspectRatio: '9 / 16',
        background: '#111',
        flexShrink: 0,
      }}
    >
      <Player
        ref={handlePlayerRef}
        component={PlayerComposition}
        inputProps={playerInputProps}
        durationInFrames={editorDuration}
        fps={30}
        compositionWidth={1080}
        compositionHeight={1920}
        controls
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      <EditorOverlay
        blocks={activeBlocks}
        selectedId={selectedBlockId}
        selectedIds={selectedBlockIds}
        onSelect={selectBlock}
        onMove={handleMove}
        onResize={handleResize}
        onRotate={handleRotate}
        onResizeSelection={handleResizeSelection}
        onRotateSelection={handleRotateSelection}
        onInteractionStart={beginInteraction}
        onInteractionEnd={endInteraction}
        onStackChildTextChange={onStackChildTextChange}
      />
    </div>
  </div>
);

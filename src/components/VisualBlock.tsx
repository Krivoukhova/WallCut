import React, { useContext } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

import type { VisualBlockData } from './VisualBlock.types';

import { getAnimationStyle } from '../domain/animation/animation';
import { getBlockMetrics } from '../domain/layout/metrics';

import { BlockRendererContext } from './blocks/BlockRendererContext';

type VisualBlockProps = {
  block: VisualBlockData;
  insideContainer?: boolean;
  insideGroup?: boolean;
  editorMode?: boolean;
  durationInFrames?: number;
  onStackChildTextChange?: (stackId: string, childId: string, text: string) => void;
};

function getBlockZIndex(zIndex: number | undefined): number {
  return zIndex ?? 0;
}

export const VisualBlock: React.FC<VisualBlockProps> = ({
  block,
  insideContainer = false,
  insideGroup = false,
  durationInFrames: resolvedDurationInFrames,
}) => {
  const BlockRenderer = useContext(BlockRendererContext);
  if (!BlockRenderer) {
    throw new Error(
      'VisualBlock must be rendered inside BlockRendererContext.Provider. ' +
        'Use BlocksScene or SpeechVisualTimeline as the rendering entry point.',
    );
  }
  const frame = useCurrentFrame();

  const { durationInFrames } = useVideoConfig();

  const blockDuration = getVisualBlockDuration(block, resolvedDurationInFrames ?? durationInFrames);

  const localFrame = frame - (block.startFrame ?? 0);

  const animation = getAnimationStyle(block.animation, localFrame, blockDuration);

  const x = (block.x ?? 540) + animation.translateX;

  const y = (block.y ?? 960) + animation.translateY;

  const scaleX = block.scaleX ?? 1;

  const scaleY = block.scaleY ?? 1;

  // Text block resizing changes the editor's selection bounds, not glyph size.
  // Keep the text font size stable while scaleX/scaleY continue to drive the
  // transform box used by the editor overlay.
  const visualScaleX = block.type === 'text' ? 1 : scaleX;
  const visualScaleY = block.type === 'text' ? 1 : scaleY;
  // Text uses a fixed font size and a separately resizable layout box. Keep
  // the rendered container dimensions in sync with the editor's selection
  // bounds, while scaling only the box (not the glyphs) via width/height.
  const textMetrics = block.type === 'text' ? getBlockMetrics(block) : null;
  const textBoxWidth = textMetrics ? (block.width ?? textMetrics.width) * scaleX : undefined;
  const textBoxHeight = textMetrics ? textMetrics.height * scaleY : undefined;

  const scale = (block.scale ?? 1) * animation.scale;

  const rotation = (block.rotation ?? 0) + animation.rotation;

  const opacity = (block.opacity ?? 1) * animation.opacity;

  const zIndex = getBlockZIndex(block.zIndex);

  const content = <BlockRenderer block={block} />;

  if (insideGroup) {
    return (
      <div
        style={{
          position: 'absolute',

          left: x,
          top: y,

          ...(textMetrics
            ? {
                width: textBoxWidth,
                height: textBoxHeight,
                boxSizing: 'border-box' as const,
              }
            : {}),

          translate: '-50% -50%',

          transform: `
            scale(
              ${scale * visualScaleX},
              ${scale * visualScaleY}
            )
            rotate(
              ${rotation}deg
            )
          `,

          opacity,

          zIndex,

          transformOrigin: 'center center',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          whiteSpace: 'nowrap',

          // Badge paints its own background, border radius and padding in
          // SimpleBlock. Applying them to this wrapper as well doubled the
          // pill's outer dimensions, so the visible badge extended beyond
          // the editor selection frame (including when nested in a group).
          backgroundColor:
            block.type === 'badge' ? 'transparent' : (block.backgroundColor ?? 'transparent'),

          borderRadius: block.type === 'badge' ? 0 : (block.borderRadius ?? 0),

          padding: block.type === 'badge' ? 0 : (block.padding ?? 0),

          boxSizing: 'border-box',
          // Clip the progress track and fill to the same rounded corners in
          // the editor canvas, not only in the rendered video.
          overflow: block.type === 'progress' || block.type === 'bar' ? 'hidden' : undefined,
        }}
      >
        {content}
      </div>
    );
  }

  if (insideContainer) {
    return (
      <div
        style={{
          position: 'relative',

          display: 'flex',

          width: '100%',
          maxWidth: '100%',
          height: '100%',
          maxHeight: '100%',
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
          boxSizing: 'border-box',

          alignItems: 'center',

          justifyContent: 'center',

          opacity,

          zIndex,

          transform: `
            translate(
              ${animation.translateX}px,
              ${animation.translateY}px
            )
            scale(
              ${scale * visualScaleX},
              ${scale * visualScaleY}
            )
            rotate(
              ${rotation}deg
            )
          `,

          transformOrigin: 'center center',

          whiteSpace: 'nowrap',

          backgroundColor: block.backgroundColor ?? 'transparent',

          borderRadius: block.borderRadius ?? 0,

          padding: block.padding ?? 0,
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',

        left: x,
        top: y,

        ...(textMetrics
          ? {
              width: textBoxWidth,
              height: textBoxHeight,
              boxSizing: 'border-box' as const,
            }
          : {}),

        translate: '-50% -50%',

        scale: `
          ${scale * visualScaleX}
          ${scale * visualScaleY}
        `,

        rotate: `${rotation}deg`,

        opacity,

        zIndex,

        transformOrigin: 'center center',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        whiteSpace: 'nowrap',

        // Badge styling is rendered by SimpleBlock itself. Keep this
        // positioning wrapper neutral so padding/background aren't applied
        // twice and the visible pill matches the resize/selection bounds.
        backgroundColor:
          block.type === 'badge' || block.type === 'circle'
            ? 'transparent'
            : (block.backgroundColor ?? 'transparent'),

        borderRadius:
          block.type === 'badge' || block.type === 'circle' ? 0 : (block.borderRadius ?? 0),

        padding: block.type === 'badge' ? 0 : (block.padding ?? 0),

        boxSizing: 'border-box',
        // Keep rounded progress corners visible while moving the block on
        // the editor canvas; clipping only inside the rendered content can
        // otherwise differ from the preview.
        overflow: block.type === 'progress' || block.type === 'bar' ? 'hidden' : undefined,
      }}
    >
      {content}
    </div>
  );
};

function getVisualBlockDuration(block: VisualBlockData, parentDuration: number): number {
  if (block.duration !== undefined) {
    return Math.max(1, block.duration);
  }

  return Math.max(1, parentDuration);
}

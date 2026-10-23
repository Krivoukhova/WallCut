import React from 'react';

import { Sequence as RemotionSequence } from 'remotion';

import { VisualBlock } from './VisualBlock';
import type { VisualBlockData } from './VisualBlock.types';

import { getBlockDuration } from '../domain/timeline/duration';

type SequenceBlockProps = {
  block: VisualBlockData;
};

export const SequenceBlock: React.FC<SequenceBlockProps> = ({ block }) => {
  let currentFrame = 0;

  const children = block.children ?? [];

  return (
    <div
      style={{
        position: 'relative',
        width: block.width ?? '100%',
        height: block.height ?? '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
      }}
    >
      {children.map((child, index) => {
        const duration = getBlockDuration(child);

        const startFrame = child.startFrame ?? currentFrame;

        currentFrame = startFrame + duration;

        return (
          <RemotionSequence key={index} from={startFrame} durationInFrames={duration}>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                overflow: 'visible',
              }}
            >
              <VisualBlock
                block={{
                  ...child,

                  // RemotionSequence applies startFrame before rendering its children.

                  // Child components receive a local frame
                  // that starts at zero.
                  startFrame: 0,

                  x: 0,
                  y: 0,
                }}
                insideContainer
              />
            </div>
          </RemotionSequence>
        );
      })}
    </div>
  );
};

import React from 'react';
import { AbsoluteFill } from 'remotion';

import { VisualBlock } from '../components/VisualBlock';
import { BlockRenderer } from '../components/blocks/BlockRenderer';
import { BlockRendererContext } from '../components/blocks/BlockRendererContext';
import type { VisualBlockData } from '../domain/blocks/blockTypes';

type BlocksSceneProps = {
  blocks: VisualBlockData[];
};

export const BlocksScene: React.FC<BlocksSceneProps> = ({ blocks }) => {
  return (
    <BlockRendererContext.Provider value={BlockRenderer}>
      <AbsoluteFill
        style={{
          color: 'white',
        }}
      >
        {blocks.map((block, index) => (
          <VisualBlock key={index} block={block} />
        ))}
      </AbsoluteFill>
    </BlockRendererContext.Provider>
  );
};

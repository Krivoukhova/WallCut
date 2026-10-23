import React from 'react';

import { VisualBlock } from './VisualBlock';
import type { VisualBlockData } from './VisualBlock.types';

type OverlayBlockProps = {
  block: VisualBlockData;
};

export const OverlayBlock: React.FC<OverlayBlockProps> = ({ block }) => {
  return (
    <div
      style={{
        position: 'relative',

        width: block.width ?? 900,

        height: block.height ?? 900,

        backgroundColor: block.backgroundColor ?? 'transparent',

        borderRadius: block.borderRadius ?? 0,

        overflow: 'visible',
      }}
    >
      {block.children?.map((child: VisualBlockData, index: number) => (
        <div
          key={index}
          style={{
            position: 'absolute',

            left: (block.width ?? 900) / 2 + (child.x ?? 0),

            top: (block.height ?? 900) / 2 + (child.y ?? 0),

            transform: `
                translate(-50%, -50%)
                scale(${child.scale ?? 1})
                rotate(${child.rotation ?? 0}deg)
              `,

            opacity: child.opacity ?? 1,

            zIndex: index,

            display: 'flex',

            alignItems: 'center',
            justifyContent: 'center',

            whiteSpace: 'nowrap',
          }}
        >
          <VisualBlock
            block={{
              ...child,
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              opacity: 1,
            }}
            insideContainer
          />
        </div>
      ))}
    </div>
  );
};

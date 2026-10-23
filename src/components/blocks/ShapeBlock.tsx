import React from 'react';

import type { VisualBlockData } from '../VisualBlock.types';

type ShapeBlockProps = {
  block: VisualBlockData;
};

export const ShapeBlock: React.FC<ShapeBlockProps> = ({ block }) => {
  switch (block.type) {
    case 'rectangle':
      return (
        <div
          style={{
            width: block.width ?? 300,
            height: block.height ?? 200,
            backgroundColor: block.backgroundColor ?? block.color ?? 'white',
            borderRadius: block.borderRadius ?? 0,
            boxSizing: 'border-box',
          }}
        />
      );

    case 'circle': {
      const size = block.width ?? block.height ?? 100;

      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: block.backgroundColor ?? block.color ?? 'white',
          }}
        />
      );
    }

    case 'line':
      return (
        <div
          style={{
            width: block.width ?? 300,
            height: block.strokeWidth ?? 5,
            backgroundColor: block.color ?? 'white',
            borderRadius: block.borderRadius ?? 999,
          }}
        />
      );

    case 'arrow': {
      const width = block.width ?? 300;
      const stroke = block.strokeWidth ?? 8;
      const color = block.color ?? 'white';

      return (
        <svg
          width={width}
          height={80}
          viewBox={`0 0 ${width} 80`}
          style={{
            overflow: 'visible',
          }}
        >
          <line
            x1={10}
            y1={40}
            x2={width - 30}
            y2={40}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
          />

          <polyline
            points={`
              ${width - 60},15
              ${width - 20},40
              ${width - 60},65
            `}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    default:
      return null;
  }
};

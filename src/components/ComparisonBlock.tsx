import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

import type { VisualBlockData } from './VisualBlock.types';

type ComparisonBlockProps = {
  block: VisualBlockData;
  animate?: boolean;
};

export const ComparisonBlock: React.FC<ComparisonBlockProps> = ({ block, animate = true }) => {
  const frame = useCurrentFrame();

  const comparison = block.comparison;

  if (!comparison) {
    return null;
  }

  const leftProgress = interpolate(animate ? frame : 18, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const rightProgress = interpolate(animate ? frame : 26, [8, 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const arrowProgress = interpolate(animate ? frame : 30, [18, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cardWidth = 330;
  const cardHeight = 280;

  const cardStyle: React.CSSProperties = {
    width: cardWidth,
    height: cardHeight,
    borderRadius: 32,
    backgroundColor: '#1b1b1b',
    border: '2px solid rgba(255,255,255,0.12)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    color: block.color ?? block.textColor ?? '#ffffff',
    fontFamily: block.fontFamily ?? 'Arial, sans-serif',
  };

  return (
    <div
      style={{
        width: block.width ?? 950,
        height: block.height ?? 500,

        display: 'flex',
        flexDirection: 'row',

        alignItems: 'center',
        justifyContent: 'center',

        gap: 25,
      }}
    >
      {}

      <div
        style={{
          ...cardStyle,

          opacity: leftProgress,

          transform: `
            translateX(
              ${interpolate(leftProgress, [0, 1], [-80, 0])}px
            )
            scale(
              ${interpolate(leftProgress, [0, 1], [0.9, 1])}
            )
          `,
        }}
      >
        <div
          style={{
            fontSize: block.fontSize ?? 34,
            fontWeight: block.fontWeight ?? 700,

            opacity: 0.65,

            marginBottom: 25,

            textAlign: 'center',

            whiteSpace: 'nowrap',
          }}
        >
          {comparison.left.title}
        </div>

        <div
          style={{
            fontSize: block.fontSize ?? 52,
            fontWeight: block.fontWeight ?? 900,

            letterSpacing: -2,

            textAlign: 'center',

            whiteSpace: 'nowrap',
          }}
        >
          {comparison.left.value}
        </div>
      </div>

      {}

      <div
        style={{
          width: 80,
          height: 80,

          display: 'flex',

          alignItems: 'center',
          justifyContent: 'center',

          flexShrink: 0,

          opacity: arrowProgress,

          transform: `
            scale(
              ${interpolate(arrowProgress, [0, 1], [0.5, 1])}
            )
          `,

          fontSize: 65,
          fontWeight: 900,
        }}
      >
        {comparison.arrow ?? '→'}
      </div>

      {}

      <div
        style={{
          ...cardStyle,

          opacity: rightProgress,

          transform: `
            translateX(
              ${interpolate(rightProgress, [0, 1], [80, 0])}px
            )
            scale(
              ${interpolate(rightProgress, [0, 1], [0.9, 1])}
            )
          `,
        }}
      >
        <div
          style={{
            fontSize: block.fontSize ?? 34,
            fontWeight: block.fontWeight ?? 700,

            opacity: 0.65,

            marginBottom: 25,

            textAlign: 'center',

            whiteSpace: 'nowrap',
          }}
        >
          {comparison.right.title}
        </div>

        <div
          style={{
            fontSize: block.fontSize ?? 52,
            fontWeight: block.fontWeight ?? 900,

            letterSpacing: -2,

            textAlign: 'center',

            whiteSpace: 'nowrap',
          }}
        >
          {comparison.right.value}
        </div>
      </div>
    </div>
  );
};

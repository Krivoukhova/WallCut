import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

import type { VisualBlockData } from './VisualBlock.types';

type StatBlockProps = {
  block: VisualBlockData;
  animate?: boolean;
};

export const StatBlock: React.FC<StatBlockProps> = ({ block, animate = true }) => {
  const frame = useCurrentFrame();

  const stat = block.stat;

  if (!stat) {
    return null;
  }

  const progress = interpolate(animate ? frame : 20, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(progress, [0, 1], [0.85, 1]);

  const translateY = interpolate(progress, [0, 1], [50, 0]);

  // Stat direction was removed from the inspector because it had no
  // meaningful visual behavior. Only an explicitly configured icon is shown.
  const icon = stat.icon ?? '';

  const color = block.color ?? block.textColor ?? '#ffffff';

  return (
    <div
      style={{
        width: block.width ?? 850,
        height: block.height ?? 500,

        padding: block.padding ?? 40,

        boxSizing: 'border-box',

        display: 'flex',
        flexDirection: 'column',

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: block.backgroundColor ?? '#1b1b1b',

        borderRadius: block.borderRadius ?? 32,

        border: block.borderWidth
          ? `${block.borderWidth}px solid ${block.borderColor ?? 'rgba(255,255,255,0.15)'}`
          : '2px solid rgba(255,255,255,0.1)',

        opacity: progress,

        transform: `
          translateY(${translateY}px)
          scale(${scale})
        `,
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: 65,
            fontWeight: 900,

            lineHeight: 1,

            marginBottom: 20,

            color,
            WebkitTextFillColor: color,
          }}
        >
          {icon}
        </div>
      )}

      <div
        style={{
          fontSize: block.fontSize ?? 110,

          fontWeight: block.fontWeight ?? 900,

          lineHeight: 1,

          letterSpacing: -3,

          whiteSpace: 'nowrap',

          color,
          WebkitTextFillColor: color,
        }}
      >
        {stat.value}
      </div>

      <div
        style={{
          marginTop: 22,

          fontSize: 42,

          fontWeight: 700,

          opacity: 0.8,

          textAlign: 'center',

          whiteSpace: 'nowrap',

          color,
          WebkitTextFillColor: color,
        }}
      >
        {stat.label}
      </div>

      {stat.detail && (
        <div
          style={{
            marginTop: 12,

            fontSize: 28,

            fontWeight: 500,

            opacity: 0.45,

            textAlign: 'center',

            whiteSpace: 'nowrap',

            color,
            WebkitTextFillColor: color,
          }}
        >
          {stat.detail}
        </div>
      )}
    </div>
  );
};

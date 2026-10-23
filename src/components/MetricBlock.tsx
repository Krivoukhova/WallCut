import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

import type { VisualBlockData } from './VisualBlock.types';

type MetricBlockProps = {
  block: VisualBlockData;
  animate?: boolean;
};

export const MetricBlock: React.FC<MetricBlockProps> = ({ block, animate = true }) => {
  const frame = useCurrentFrame();

  const metric = block.metric;

  if (!metric) {
    return null;
  }

  const progress = interpolate(animate ? frame : 20, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(progress, [0, 1], [80, 0]);

  const scale = interpolate(progress, [0, 1], [0.8, 1]);

  const direction = metric.direction ?? 'neutral';

  const defaultIcon = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '';

  const icon = metric.icon ?? defaultIcon;

  const color = block.color ?? block.textColor ?? '#ffffff';

  return (
    <div
      style={{
        width: block.width ?? 800,
        height: block.height ?? 400,

        display: 'flex',
        flexDirection: 'column',

        alignItems: 'center',
        justifyContent: 'center',

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
            width: 110,
            height: 110,

            marginBottom: 20,

            borderRadius: '50%',

            backgroundColor: block.backgroundColor ?? '#222222',

            display: 'flex',

            alignItems: 'center',
            justifyContent: 'center',

            fontSize: 70,
            fontWeight: 900,

            lineHeight: 1,

            color,
            WebkitTextFillColor: color,
          }}
        >
          {icon}
        </div>
      )}

      <div
        style={{
          fontSize: block.fontSize ?? 100,

          fontWeight: block.fontWeight ?? 900,

          letterSpacing: -3,

          lineHeight: 1,

          whiteSpace: 'nowrap',

          color,
          WebkitTextFillColor: color,
        }}
      >
        {metric.value}
      </div>

      <div
        style={{
          marginTop: 20,

          fontSize: 40,

          fontWeight: 600,

          opacity: 0.65,

          textAlign: 'center',

          whiteSpace: 'nowrap',

          color,
          WebkitTextFillColor: color,
        }}
      >
        {metric.label}
      </div>
    </div>
  );
};

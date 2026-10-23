import React from 'react';
import { useCurrentFrame } from 'remotion';

type ChartBlockProps = {
  values: number[];
  labels?: string[];
  yLabels?: string[];

  xAxisLabel?: string;
  yAxisLabel?: string;

  width?: number;
  height?: number;

  color?: string;
  backgroundColor?: string;

  borderRadius?: number;

  startFrame?: number;
  duration?: number;
  animate?: boolean;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
};

export const BarChart: React.FC<ChartBlockProps> = ({
  values,
  labels,

  width = 800,
  height = 500,

  color = 'white',
  backgroundColor = 'rgba(255,255,255,0.10)',

  borderRadius = 16,

  startFrame = 0,
  duration = 30,
  animate = true,
  fontSize = 28,
  fontWeight = 800,
  fontFamily = 'Arial, sans-serif',
}) => {
  const frame = useCurrentFrame();

  if (!values.length) {
    return null;
  }

  const progress = animationProgress(animate ? frame : startFrame + duration, startFrame, duration);

  const easedProgress = 1 - Math.pow(1 - progress, 3);

  const maxValue = Math.max(...values, 100);

  /*
   * The supplied width and height define the chart's outer dimensions.
   */

  const topPadding = 35;

  const chartWidth = width;

  const chartHeight = height - topPadding;

  const gap = 20;

  const barWidth = Math.max(1, (chartWidth - gap * (values.length - 1)) / values.length);

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'visible',
        boxSizing: 'border-box',
      }}
    >

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: topPadding,
          width: 3,
          height: chartHeight,
          backgroundColor: color,
          opacity: easedProgress,
        }}
      />

      <div
        style={{
          position: 'absolute',

          left: 0,
          top: topPadding,

          width: chartWidth,
          height: chartHeight,

          display: 'flex',
          alignItems: 'flex-end',

          gap,

          boxSizing: 'border-box',

          overflow: 'visible',
        }}
      >
        {values.map((value, index) => {

          const normalizedValue = value / maxValue;

          const clampedValue = Math.max(0, Math.min(1, normalizedValue));

          const targetHeight = clampedValue * chartHeight;

          const currentHeight = targetHeight * easedProgress;

          const label = labels?.[index];

          return (
            <div
              key={index}
              style={{
                width: barWidth,
                height: chartHeight,

                display: 'flex',
                flexDirection: 'column',

                alignItems: 'center',
                justifyContent: 'flex-end',

                position: 'relative',

                overflow: 'visible',
              }}
            >

              <div
                style={{
                  position: 'absolute',

                  bottom: currentHeight + 12,

                  fontSize,
                  fontWeight,

                  opacity: easedProgress,

                  fontFamily,
                  color,
                  whiteSpace: 'nowrap',

                  fontVariantNumeric: 'tabular-nums',

                  pointerEvents: 'none',
                }}
              >
                {formatNumber(value)}
              </div>

              <div
                style={{
                  width: '100%',

                  height: currentHeight,

                  minHeight: currentHeight > 0 ? 2 : 0,

                  backgroundColor: color,

                  borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,

                  boxSizing: 'border-box',

                  flexShrink: 0,
                }}
              />

              {label && (
                <div
                  style={{
                    position: 'absolute',

                    top: chartHeight + 18,

                    left: 0,
                    right: 0,

                    textAlign: 'center',

                    fontSize: Math.max(12, fontSize * 0.85),
                    fontWeight: Math.min(fontWeight, 700),
                    fontFamily,
                    color,

                    opacity: 0.85 * easedProgress,

                    whiteSpace: 'nowrap',

                    overflow: 'visible',

                    pointerEvents: 'none',
                  }}
                >
                  {label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',

          left: 0,

          top: topPadding + chartHeight,

          width: chartWidth,

          height: 3,

          backgroundColor: color,

          opacity: easedProgress,
        }}
      />

      {backgroundColor && (
        <div
          style={{
            position: 'absolute',

            left: 0,
            top: topPadding,

            width: chartWidth,
            height: chartHeight,

            backgroundColor: 'transparent',

            borderRadius,

            pointerEvents: 'none',

            zIndex: -1,
          }}
        />
      )}
    </div>
  );
};

function animationProgress(frame: number, startFrame: number, duration: number): number {
  if (frame <= startFrame) {
    return 0;
  }

  if (frame >= startFrame + duration) {
    return 1;
  }

  return (frame - startFrame) / duration;
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('ru-RU');
}

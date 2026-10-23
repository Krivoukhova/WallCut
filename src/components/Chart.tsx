import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';

type ChartProps = {
  values: number[];

  labels?: string[];
  yLabels?: string[];

  xAxisLabel?: string;
  yAxisLabel?: string;

  width?: number;
  height?: number;

  startFrame?: number;
  duration?: number;
  animate?: boolean;
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
};

export const Chart: React.FC<ChartProps> = ({
  values,

  labels,
  yLabels,

  xAxisLabel,
  yAxisLabel,

  width = 800,
  height = 400,

  startFrame = 0,
  duration = 45,
  animate = true,
  color = '#ffffff',
  fontSize = 24,
  fontWeight = 600,
  fontFamily = 'Arial, sans-serif',
}) => {
  const frame = useCurrentFrame();

  if (values.length < 2) {
    return null;
  }

  const effectiveDuration = Math.max(duration, 1);

  const progress = interpolate(
    animate ? frame : startFrame + effectiveDuration,
    [startFrame, startFrame + effectiveDuration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',

      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  const min = Math.min(...values);
  const max = Math.max(...values);

  const valueRange = Math.max(max - min, 1);

  const leftAxisSpace = 0;
  const topAxisSpace = 20;

  const chartWidth = width;
  const chartHeight = height - topAxisSpace;

  const points = values.map((value, index) => {
    const x = values.length <= 1 ? 0 : (index / (values.length - 1)) * chartWidth;

    const normalized = (value - min) / valueRange;

    const y = chartHeight - normalized * chartHeight;

    return {
      x,
      y,
    };
  });

  const path = points
    .map((point, index) => {
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y + topAxisSpace}`;
    })
    .join(' ');

  let pathLength = 0;

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;

    const dy = points[i].y - points[i - 1].y;

    pathLength += Math.sqrt(dx * dx + dy * dy);
  }

  const dashOffset = pathLength * (1 - progress);

  const generatedYLabels = createYLabels(min, max, yLabels);

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
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,

          overflow: 'visible',
        }}
      >

        {generatedYLabels.map((_, index) => {
          const ratio = generatedYLabels.length <= 1 ? 0 : index / (generatedYLabels.length - 1);

          const y = topAxisSpace + chartHeight * (1 - ratio);

          return (
            <line
              key={`grid-${index}`}
              x1={0}
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={2}
            />
          );
        })}

        <line
          x1={leftAxisSpace}
          y1={topAxisSpace}
          x2={leftAxisSpace}
          y2={topAxisSpace + chartHeight}
          stroke={color}
          strokeWidth={3}
          opacity={progress}
        />

        <line
          x1={leftAxisSpace}
          y1={topAxisSpace + chartHeight}
          x2={chartWidth}
          y2={topAxisSpace + chartHeight}
          stroke={color}
          strokeWidth={3}
          opacity={progress}
        />

        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={dashOffset}
        />

        {points.map((point, index) => {
          const pointPosition = index / (points.length - 1);

          const pointOpacity = progress >= pointPosition ? 1 : 0;

          return (
            <circle
              key={index}
              cx={point.x}
              cy={point.y + topAxisSpace}
              r={8}
              fill="white"
              opacity={pointOpacity}
            />
          );
        })}
      </svg>

      {generatedYLabels.map((label, index) => {
        const ratio = generatedYLabels.length <= 1 ? 0 : index / (generatedYLabels.length - 1);

        const y = topAxisSpace + chartHeight * (1 - ratio);

        return (
          <div
            key={`y-label-${index}`}
            style={{
              position: 'absolute',

              /*
               * Position the label to the left of the y-axis.
               */
              right: 'calc(100% + 14px)',

              top: y,

              transform: 'translateY(-50%)',

              width: 100,

              textAlign: 'right',

              fontSize,
              fontWeight,
              fontFamily,
              lineHeight: 1,

              whiteSpace: 'nowrap',

              opacity: 0.85 * progress,

              fontVariantNumeric: 'tabular-nums',

              pointerEvents: 'none',
            }}
          >
            {label}
          </div>
        );
      })}

      {yAxisLabel && (
        <div
          style={{
            position: 'absolute',

            /*
             * Anchor the title to the plot center before rotation.

             */
            left: -75,

            top: topAxisSpace + chartHeight / 2,

            transform: 'translate(-50%, -50%) rotate(-90deg)',

            transformOrigin: 'center center',

            fontSize,
            fontWeight: 700,
            fontFamily,
            lineHeight: 1,

            whiteSpace: 'nowrap',

            opacity: progress,

            pointerEvents: 'none',
          }}
        >
          {yAxisLabel}
        </div>
      )}

      {labels?.map((label, index) => {
        if (!label) {
          return null;
        }

        const x = labels.length <= 1 ? 0 : (index / (labels.length - 1)) * chartWidth;

        return (
          <div
            key={`x-label-${index}`}
            style={{
              position: 'absolute',

              left: x,

              top: topAxisSpace + chartHeight + 18,

              transform: 'translateX(-50%)',

              fontSize,
              fontWeight,
              fontFamily,
              lineHeight: 1,

              whiteSpace: 'nowrap',

              opacity: 0.85 * progress,

              pointerEvents: 'none',
            }}
          >
            {label}
          </div>
        );
      })}

      {xAxisLabel && (
        <div
          style={{
            position: 'absolute',

            left: 0,

            top: topAxisSpace + chartHeight + 58,

            width: chartWidth,

            textAlign: 'center',

            fontSize,
            fontWeight: 700,
            lineHeight: 1,

            whiteSpace: 'nowrap',

            opacity: progress,

            pointerEvents: 'none',
          }}
        >
          {xAxisLabel}
        </div>
      )}
    </div>
  );
};

function createYLabels(min: number, max: number, labels?: string[]): string[] {
  /* Explicit y-axis labels affect presentation only, not the data range. */
  if (labels && labels.length > 0) {
    return labels.slice().reverse();
  }

  /* Generate y-axis labels from the data range when none are supplied. */

  const count = 5;

  return Array.from({ length: count }, (_, index) => {
    const ratio = index / (count - 1);

    const value = min + (max - min) * ratio;

    return formatNumber(value);
  }).reverse();
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('ru-RU');
}

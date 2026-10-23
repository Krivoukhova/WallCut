import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

import type { VisualBlockData } from '../VisualBlock.types';
import { getBlockMetrics } from '../../domain/layout/metrics';

type SimpleBlockProps = {
  block: VisualBlockData;
};

export const SimpleBlock: React.FC<SimpleBlockProps> = ({ block }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  switch (block.type) {
    case 'bar':
      return (
        <ProgressBar
          value={block.toValue ?? ((block.value ?? 0) / Math.max(1, block.max ?? 100)) * 100}
          max={100}
          fromValue={block.fromValue ?? 0}
          width={block.width ?? 500}
          height={block.height ?? 60}
          color={block.color ?? 'white'}
          backgroundColor={block.backgroundColor ?? 'rgba(255,255,255,0.12)'}
          borderRadius={block.borderRadius ?? 999}
          direction={block.direction ?? 'horizontal'}
          progressFrame={frame}
          startFrame={block.startFrame ?? 0}
          duration={block.duration ?? 30}
          fillDuration={block.fillDuration}
          fps={fps}
        />
      );

    case 'progress':
      return (
        <ProgressBar
          value={block.toValue ?? ((block.value ?? 0) / Math.max(1, block.max ?? 100)) * 100}
          max={100}
          fromValue={block.fromValue ?? 0}
          width={block.width ?? 700}
          height={block.height ?? 35}
          color={block.color ?? 'white'}
          backgroundColor={block.backgroundColor ?? 'rgba(255,255,255,0.12)'}
          borderRadius={block.borderRadius ?? 999}
          direction="horizontal"
          progressFrame={frame}
          startFrame={block.startFrame ?? 0}
          duration={block.duration ?? 30}
          fillDuration={block.fillDuration}
          fps={fps}
        />
      );

    case 'badge': {
      // Render the badge inside the same measured box used by the editor
      // selection overlay. Without explicit dimensions the flex item sizes
      // itself from its text, while the overlay uses model metrics.
      const badgeMetrics = getBlockMetrics(block);
      return (
        <div
          style={{
            width: badgeMetrics.width,
            height: badgeMetrics.height,
            display: 'flex',
            alignItems:
              block.align === 'start'
                ? 'flex-start'
                : block.align === 'end'
                  ? 'flex-end'
                  : 'center',
            justifyContent:
              block.justify === 'start'
                ? 'flex-start'
                : block.justify === 'end'
                  ? 'flex-end'
                  : 'center',
            gap: block.gap ?? 0,
            backgroundColor: block.backgroundColor ?? '#333333',
            borderRadius: block.borderRadius ?? 999,
            border: block.borderWidth
              ? `${block.borderWidth}px solid ${block.borderColor ?? 'white'}`
              : 'none',
            color: block.textColor ?? block.color ?? 'white',
            fontSize: block.fontSize ?? 36,
            fontWeight: block.fontWeight ?? 800,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
            // Do not clip the pill when font glyphs are slightly wider than
            // the layout estimate; the model metrics reserve extra width.
            padding: block.padding ?? '14px 24px',
          }}
        >
          {block.text}
        </div>
      );
    }

    case 'image': {
      const src = block.image ?? '';
      const isDataImage = src.startsWith('data:image/');

      return (
        <div
          style={{
            width: block.width ?? 300,
            height: block.height ?? 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: block.backgroundColor ?? 'transparent',
            borderRadius: block.borderRadius ?? 0,
            border: block.borderWidth
              ? `${block.borderWidth}px solid ${block.borderColor ?? 'white'}`
              : 'none',
            color: block.color ?? 'white',
            fontSize: block.fontSize ?? 70,
            fontWeight: block.fontWeight ?? 900,
            lineHeight: 1,
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {isDataImage ? (
            /* eslint-disable-next-line @remotion/warn-native-media-tag */
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          ) : (
            <span style={{ opacity: 0.5 }}>Image</span>
          )}
        </div>
      );
    }

    default:
      return null;
  }
};

type ProgressBarProps = {
  value: number;
  max: number;
  fromValue: number;
  width: number;
  height: number;
  color: string;
  backgroundColor: string;
  borderRadius: number;
  direction: 'horizontal' | 'vertical';
  progressFrame: number;
  startFrame: number;
  duration: number;
  fillDuration?: number;
  fps: number;
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  fromValue,
  width,
  height,
  color,
  backgroundColor,
  borderRadius,
  direction,
  progressFrame,
  startFrame,
  duration,
  fillDuration,
  fps,
}) => {
  const safeMax = Math.max(1, max);
  const fromProgress = Math.min(1, Math.max(0, fromValue / 100));
  const toProgress = Math.min(1, Math.max(0, value / safeMax));

  // Explicit fill duration is independent of the block/scene duration.
  // This lets users intentionally animate the fill over any amount of time.
  const fillDurationFrames =
    fillDuration == null ? duration : Math.max(0, Math.round(fillDuration * fps));

  const animatedProgress = interpolateValue(
    animationProgress(progressFrame, startFrame, fillDurationFrames),
    fromProgress,
    toProgress,
  );

  return (
    <div
      style={{
        width,
        height,
        backgroundColor,
        borderRadius,
        overflow: 'hidden',
        display: 'flex',
        alignItems: direction === 'vertical' ? 'flex-end' : 'center',
      }}
    >
      <div
        style={{
          width: direction === 'horizontal' ? `${animatedProgress * 100}%` : '100%',
          height: direction === 'vertical' ? `${animatedProgress * 100}%` : '100%',
          backgroundColor: color,
          borderRadius,
        }}
      />
    </div>
  );
};

function animationProgress(frame: number, startFrame: number, duration: number): number {
  // A zero-length fill should complete immediately instead of
  // producing NaN/Infinity from division by zero.
  if (duration <= 0) {
    return frame >= startFrame ? 1 : 0;
  }

  if (frame <= startFrame) {
    return 0;
  }

  if (frame >= startFrame + duration) {
    return 1;
  }

  return (frame - startFrame) / duration;
}

function interpolateValue(progress: number, from: number, to: number): number {
  return from + (to - from) * progress;
}

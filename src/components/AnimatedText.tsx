import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

type AnimatedTextProps = {
  children: React.ReactNode;
  startFrame?: number;
  duration?: number;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  color?: string;
  animate?: boolean;
  width?: number;
  height?: number;
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  startFrame = 0,
  duration = 15,
  fontSize = 72,
  fontWeight = 800,
  fontFamily = 'Arial, sans-serif',
  color = '#ffffff',
  animate = true,
  width,
  height,
}) => {
  const frame = useCurrentFrame();

  const localFrame = frame - startFrame;

  const shouldAnimate = animate && duration > 0;

  const opacity = shouldAnimate
    ? interpolate(localFrame, [0, duration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const scale = shouldAnimate
    ? interpolate(localFrame, [0, duration], [0.92, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,

        fontSize: `${fontSize}px`,
        width,
        height,
        boxSizing: 'border-box',
        fontWeight,

        // Keep every line centered, including after an explicit newline.
        // Without an explicit alignment, multiline text falls back to the
        // browser's default left alignment.
        textAlign: 'center',

        color: color,

        // Keep the glyph fill aligned with the configured text color.
        WebkitTextFillColor: color,

        fontFamily,
        fontStyle: 'normal',
        // Preserve explicit line breaks entered in the inspector textarea.
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        wordBreak: 'normal',
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    >
      {children}
    </div>
  );
};

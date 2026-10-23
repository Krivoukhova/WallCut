import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';

type AnimatedNumberProps = {
  from: number;
  to: number;
  startFrame?: number;
  duration?: number;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  color?: string;
  suffix?: string;
};

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  from,
  to,
  startFrame = 0,
  duration = 30,
  fontSize = 100,
  fontWeight = 900,
  fontFamily = 'Arial, sans-serif',
  color = '#ffffff',
  suffix = '',
}) => {
  const frame = useCurrentFrame();

  const value = interpolate(frame, [startFrame, startFrame + duration], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        fontFamily,
        color,
        WebkitTextFillColor: color,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {Math.round(value).toLocaleString('ru-RU')}
      {suffix}
    </div>
  );
};

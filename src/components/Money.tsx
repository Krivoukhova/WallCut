import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

type MoneyProps = {
  amount: number;
  suffix?: string;
  startFrame?: number;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  color?: string;
  animate?: boolean;
};

export const Money: React.FC<MoneyProps> = ({
  amount,
  suffix = '₽',
  startFrame = 0,
  fontSize = 100,
  fontWeight = 900,
  fontFamily = 'Arial, sans-serif',
  color = '#ffffff',
  animate = true,
}) => {
  const frame = useCurrentFrame();

  const localFrame = frame - startFrame;

  const opacity = animate
    ? interpolate(localFrame, [0, 12], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const translateY = animate
    ? interpolate(localFrame, [0, 12], [80, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const scale = animate
    ? interpolate(localFrame, [0, 12], [0.7, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        fontSize,
        fontWeight,
        fontFamily,
        color,
        WebkitTextFillColor: color,
        letterSpacing: '-3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {suffix && (
        <span
          style={{
            marginRight: 18,
          }}
        >
          {suffix}
        </span>
      )}

      {amount.toLocaleString('ru-RU')}
    </div>
  );
};

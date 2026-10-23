import React from 'react';
import type { CSSProperties } from 'react';
import type { BackgroundStyle } from '../domain/background/backgroundTypes';

type SceneBackgroundProps = {
  background: BackgroundStyle;
};

/** Renders the visual background below all scene blocks. */
export const SceneBackground: React.FC<SceneBackgroundProps> = ({ background }) => {
  const style: CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    opacity: background.opacity ?? 1,
  };

  if (background.type === 'solid') {
    style.backgroundColor = background.color;
  } else if (background.type === 'gradient') {
    const stops = [...background.stops]
      .sort((a, b) => a.position - b.position)
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(', ');
    style.backgroundImage = `linear-gradient(${background.angle}deg, ${stops})`;
  } else {
    style.backgroundColor = '#111318';
    if (background.assetId.startsWith('data:image/')) {
      style.backgroundImage = `url("${background.assetId}")`;
      style.backgroundSize = background.fit ?? 'cover';
      style.backgroundPosition = `${background.positionX ?? 50}% ${background.positionY ?? 50}%`;
      style.backgroundRepeat = 'no-repeat';
    }
  }

  return <div aria-hidden="true" style={style} />;
};

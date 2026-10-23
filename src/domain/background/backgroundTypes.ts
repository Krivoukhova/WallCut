/**
 * Serializable background styles shared by the project and individual scenes.
 * Image backgrounds store a portable data:image URL in assetId so imported
 * backgrounds survive project save and export without a separate asset lookup.
 * Other browser-only objects (File/Blob/URL instances) never belong in the document.
 */
export type SolidBackground = {
  type: 'solid';
  color: string;
  /** 0 = transparent, 1 = opaque. */
  opacity?: number;
};

export type GradientBackground = {
  type: 'gradient';
  angle: number;
  /** 0 = transparent, 1 = opaque. */
  opacity?: number;
  stops: Array<{
    color: string;
    /** Normalized stop position in the inclusive range 0..100. */
    position: number;
  }>;
};

export type ImageBackground = {
  type: 'image';
  assetId: string;
  /** 0 = transparent, 1 = opaque. */
  opacity?: number;
  fit?: 'cover' | 'contain';
  positionX?: number;
  positionY?: number;
};

export type BackgroundStyle = SolidBackground | GradientBackground | ImageBackground;

/** Used when neither the project nor the scene defines a background. */
export const DEFAULT_BACKGROUND: SolidBackground = {
  type: 'solid',
  color: '#111318',
};

/**
 * Resolve background inheritance. A scene override always wins; otherwise use
 * the project default, then the editor's stable fallback.
 */
export function resolveBackground(
  sceneBackground?: BackgroundStyle | null,
  projectBackground?: BackgroundStyle | null,
): BackgroundStyle {
  return sceneBackground ?? projectBackground ?? DEFAULT_BACKGROUND;
}

/** Small runtime guard for untrusted serialized project data. */
export function isBackgroundStyle(value: unknown): value is BackgroundStyle {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const background = value as Record<string, unknown>;

  if (background.type === 'solid') {
    return (
      typeof background.color === 'string' &&
      background.color.trim().length > 0 &&
      (background.opacity === undefined ||
        (typeof background.opacity === 'number' &&
          Number.isFinite(background.opacity) &&
          background.opacity >= 0 &&
          background.opacity <= 1))
    );
  }

  if (background.type === 'gradient') {
    return (
      Number.isFinite(background.angle) &&
      (background.opacity === undefined ||
        (typeof background.opacity === 'number' &&
          Number.isFinite(background.opacity) &&
          background.opacity >= 0 &&
          background.opacity <= 1)) &&
      Array.isArray(background.stops) &&
      background.stops.length >= 2 &&
      background.stops.every((stop) => {
        if (!stop || typeof stop !== 'object' || Array.isArray(stop)) return false;
        const item = stop as Record<string, unknown>;
        return (
          typeof item.color === 'string' &&
          item.color.trim().length > 0 &&
          typeof item.position === 'number' &&
          Number.isFinite(item.position) &&
          item.position >= 0 &&
          item.position <= 100
        );
      })
    );
  }

  if (background.type === 'image') {
    return (
      typeof background.assetId === 'string' &&
      background.assetId.trim().length > 0 &&
      (background.opacity === undefined ||
        (typeof background.opacity === 'number' &&
          Number.isFinite(background.opacity) &&
          background.opacity >= 0 &&
          background.opacity <= 1)) &&
      (background.fit === undefined ||
        background.fit === 'cover' ||
        background.fit === 'contain') &&
      (background.positionX === undefined ||
        (typeof background.positionX === 'number' && Number.isFinite(background.positionX))) &&
      (background.positionY === undefined ||
        (typeof background.positionY === 'number' && Number.isFinite(background.positionY)))
    );
  }

  return false;
}

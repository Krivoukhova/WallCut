function cubicBezierEase(t: number, x1: number, y1: number, x2: number, y2: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i += 1) {
    const u = (lo + hi) / 2;
    const x = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u ** 2 * x2 + u ** 3;
    if (x < t) lo = u;
    else hi = u;
  }
  const u = (lo + hi) / 2;
  return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u ** 2 * y2 + u ** 3;
}

function interpolate(
  value: number,
  inputRange: number[],
  outputRange: number[],
  options: {
    extrapolateLeft?: 'clamp' | 'extend';
    extrapolateRight?: 'clamp' | 'extend';
    easing?: (value: number) => number;
  } = {},
): number {
  const left = inputRange[0];
  const right = inputRange[inputRange.length - 1];
  let t = (value - left) / (right - left);
  if (options.extrapolateLeft === 'clamp') t = Math.max(0, t);
  if (options.extrapolateRight === 'clamp') t = Math.min(1, t);
  if (options.easing) t = options.easing(t);
  if (inputRange.length === 2 && outputRange.length === 2) {
    return outputRange[0] + (outputRange[1] - outputRange[0]) * t;
  }
  for (let i = 0; i < inputRange.length - 1; i += 1) {
    if (value <= inputRange[i + 1]) {
      const local = (value - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
      return outputRange[i] + (outputRange[i + 1] - outputRange[i]) * local;
    }
  }
  return outputRange[outputRange.length - 1];
}

const defaultAnimationEasing = (value: number) => cubicBezierEase(value, 0.16, 1, 0.3, 1);

export type AnimationType =
  | 'none'
  | 'fade'
  | 'pop'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'bounce'
  | 'rotate';

export type AnimationPreset =
  | 'none'
  | 'minimal'
  | 'smooth'
  | 'pop'
  | 'slide'
  | 'dramatic'
  | 'attention';

export type AnimationConfig = {
  enter?: AnimationType;
  exit?: AnimationType;

  duration?: number;
  exitDuration?: number;

  delay?: number;
  exitDelay?: number;

  intensity?: number;
};

export type AnimationValue = AnimationType | AnimationPreset | AnimationConfig;

export type NormalizedAnimation = {
  enter: AnimationType;
  exit: AnimationType;

  duration: number;
  exitDuration: number;

  delay: number;
  exitDelay: number;

  intensity: number;
};

export type AnimationResult = {
  opacity: number;

  translateX: number;
  translateY: number;

  scale: number;

  rotation: number;
};

const DEFAULT_DURATION = 15;
const DEFAULT_EXIT_DURATION = 12;

export const ANIMATION_PRESETS: Record<AnimationPreset, AnimationConfig> = {
  none: {
    enter: 'none',
    exit: 'none',

    // Deliberately empty timing: normalizeAnimation supplies the
    // standard values while enter/exit remain disabled.
  },

  minimal: {
    enter: 'fade',
    exit: 'fade',

    duration: 12,
    exitDuration: 10,

    intensity: 1,
  },

  smooth: {
    enter: 'slideUp',
    exit: 'fade',

    duration: 18,
    exitDuration: 12,

    intensity: 0.7,
  },

  pop: {
    enter: 'pop',
    exit: 'fade',

    duration: 18,
    exitDuration: 12,

    intensity: 1,
  },

  slide: {
    enter: 'slideUp',
    exit: 'slideDown',

    duration: 18,
    exitDuration: 14,

    intensity: 1,
  },

  dramatic: {
    enter: 'rotate',
    exit: 'slideDown',

    duration: 22,
    exitDuration: 16,

    intensity: 1.2,
  },

  attention: {
    enter: 'bounce',
    exit: 'fade',

    duration: 20,
    exitDuration: 12,

    intensity: 1.25,
  },
};

function isAnimationPreset(value: string): value is AnimationPreset {
  return (
    value === 'none' ||
    value === 'minimal' ||
    value === 'smooth' ||
    value === 'pop' ||
    value === 'slide' ||
    value === 'dramatic' ||
    value === 'attention'
  );
}

export function normalizeAnimation(animation: AnimationValue | undefined): NormalizedAnimation {
  /*
   * No animation
   */

  if (!animation) {
    return {
      enter: 'none',
      exit: 'none',

      duration: DEFAULT_DURATION,

      exitDuration: DEFAULT_EXIT_DURATION,

      delay: 0,
      exitDelay: 0,

      intensity: 1,
    };
  }

  /*
   * String animation
   */

  if (typeof animation === 'string') {
    /*
     * Preset
     */

    if (isAnimationPreset(animation)) {
      return normalizeAnimation(ANIMATION_PRESETS[animation]);
    }

    /*
     * Individual animation
     */

    return {
      enter: animation,
      exit: 'none',

      duration: DEFAULT_DURATION,

      exitDuration: DEFAULT_EXIT_DURATION,

      delay: 0,
      exitDelay: 0,

      intensity: 1,
    };
  }

  /*
   * Explicit configuration
   */

  return {
    enter: animation.enter ?? 'none',

    exit: animation.exit ?? 'none',

    duration: animation.duration ?? DEFAULT_DURATION,

    exitDuration: animation.exitDuration ?? DEFAULT_EXIT_DURATION,

    delay: animation.delay ?? 0,

    exitDelay: animation.exitDelay ?? 0,

    intensity: animation.intensity ?? 1,
  };
}

export function getRequiredAnimationDuration(animation: AnimationValue | undefined): number {
  const config = normalizeAnimation(animation);
  const enterEnd = config.enter !== 'none' ? config.delay + config.duration : 0;
  const exitEnd = config.exit !== 'none' ? config.exitDelay + config.exitDuration : 0;

  // Enter and Exit live inside the same block and may overlap.
  // Therefore the minimum block length is the longest individual span,
  // not Enter + Exit.
  return Math.max(1, enterEnd, exitEnd);
}

export function constrainAnimationToBlock(
  animation: AnimationValue | undefined,
  blockDurationInFrames: number,
): NormalizedAnimation {
  const config = normalizeAnimation(animation);
  const blockDuration = Math.max(1, Math.floor(blockDurationInFrames));

  const enterDuration =
    config.enter === 'none'
      ? config.duration
      : Math.min(config.duration, Math.max(1, blockDuration));
  const enterDelay =
    config.enter === 'none'
      ? config.delay
      : Math.min(config.delay, Math.max(0, blockDuration - enterDuration));

  const exitDuration =
    config.exit === 'none'
      ? config.exitDuration
      : Math.min(config.exitDuration, Math.max(1, blockDuration));
  const exitDelay =
    config.exit === 'none'
      ? config.exitDelay
      : Math.min(config.exitDelay, Math.max(0, blockDuration - exitDuration));

  return {
    ...config,
    duration: enterDuration,
    delay: enterDelay,
    exitDuration,
    exitDelay,
  };
}

export function getAnimationPreset(
  animation: AnimationValue | undefined,
): AnimationPreset | 'custom' {
  const normalized = normalizeAnimation(animation);

  const presets = Object.entries(ANIMATION_PRESETS) as [AnimationPreset, AnimationConfig][];

  for (const [preset, config] of presets) {
    const presetAnimation = normalizeAnimation(config);

    if (
      normalized.enter === presetAnimation.enter &&
      normalized.exit === presetAnimation.exit &&
      normalized.duration === presetAnimation.duration &&
      normalized.exitDuration === presetAnimation.exitDuration &&
      normalized.delay === presetAnimation.delay &&
      normalized.exitDelay === presetAnimation.exitDelay &&
      normalized.intensity === presetAnimation.intensity
    ) {
      return preset;
    }
  }

  return 'custom';
}

export function getAnimationStyle(
  animation: AnimationValue | undefined,

  frame: number,

  blockDurationInFrames: number,
): AnimationResult {
  const config = constrainAnimationToBlock(animation, blockDurationInFrames);

  let result: AnimationResult = {
    opacity: 1,

    translateX: 0,
    translateY: 0,

    scale: 1,

    rotation: 0,
  };

  const enterFrame = frame - config.delay;

  const enterProgress = interpolate(enterFrame, [0, config.duration], [0, 1], {
    extrapolateLeft: 'clamp',

    extrapolateRight: 'clamp',

    easing: defaultAnimationEasing,
  });

  if (config.enter === 'none') {
    result = applyAnimation('none', 1, config.intensity);
  } else if (frame < config.delay) {
    result = applyAnimation(config.enter, 0, config.intensity);
  } else {
    result = applyAnimation(config.enter, enterProgress, config.intensity);
  }

  if (config.exit !== 'none') {
    const exitStart = Math.max(0, blockDurationInFrames - config.exitDuration - config.exitDelay);

    const exitFrame = frame - exitStart;

    const exitProgress = interpolate(exitFrame, [0, config.exitDuration], [0, 1], {
      extrapolateLeft: 'clamp',

      extrapolateRight: 'clamp',

      easing: defaultAnimationEasing,
    });

    if (frame >= exitStart) {
      const exitResult = applyExitAnimation(config.exit, exitProgress, config.intensity);

      /*
       * Fade exit
       */

      if (config.exit === 'fade') {
        result.opacity *= 1 - exitProgress;
      } else {
        /*
         * Other exits:
         * animate transform + fade.
         */

        result.opacity *= 1 - exitProgress;

        result.translateX += exitResult.translateX;

        result.translateY += exitResult.translateY;

        result.scale *= exitResult.scale;

        result.rotation += exitResult.rotation;
      }
    }
  }

  return result;
}

function applyExitAnimation(
  type: AnimationType,
  progress: number,
  intensity: number,
): AnimationResult {
  switch (type) {
    case 'none':
      return {
        opacity: 1,
        translateX: 0,
        translateY: 0,
        scale: 1,
        rotation: 0,
      };

    case 'fade':
      return {
        opacity: 1,
        translateX: 0,
        translateY: 0,
        scale: 1,
        rotation: 0,
      };

    case 'pop':
      return {
        opacity: 1,
        translateX: 0,
        translateY: 0,
        scale: interpolate(progress, [0, 1], [1, 1 - 0.25 * intensity]),
        rotation: 0,
      };

    case 'slideUp':
      return {
        opacity: 1,
        translateX: 0,
        translateY: progress * -120 * intensity,
        scale: 1,
        rotation: 0,
      };

    case 'slideDown':
      return {
        opacity: 1,
        translateX: 0,
        translateY: progress * 120 * intensity,
        scale: 1,
        rotation: 0,
      };

    case 'slideLeft':
      return {
        opacity: 1,
        translateX: progress * -180 * intensity,
        translateY: 0,
        scale: 1,
        rotation: 0,
      };

    case 'slideRight':
      return {
        opacity: 1,
        translateX: progress * 180 * intensity,
        translateY: 0,
        scale: 1,
        rotation: 0,
      };

    case 'bounce': {
      const bounce = Math.sin(progress * Math.PI * 2) * progress * 25 * intensity;

      return {
        opacity: 1,
        translateX: 0,
        translateY: bounce,
        scale: 1,
        rotation: 0,
      };
    }

    case 'rotate':
      return {
        opacity: 1,
        translateX: 0,
        translateY: 0,
        scale: 1,
        rotation: progress * 20 * intensity,
      };

    default:
      return {
        opacity: 1,
        translateX: 0,
        translateY: 0,
        scale: 1,
        rotation: 0,
      };
  }
}

function applyAnimation(type: AnimationType, progress: number, intensity: number): AnimationResult {
  switch (type) {
    case 'none':
      return {
        opacity: 1,

        translateX: 0,
        translateY: 0,

        scale: 1,

        rotation: 0,
      };

    case 'fade':
      return {
        opacity: progress,

        translateX: 0,
        translateY: 0,

        scale: 1,

        rotation: 0,
      };

    case 'pop': {
      const scale = interpolate(
        progress,
        [0, 0.7, 1],
        [1 - 0.25 * intensity, 1 + 0.05 * intensity, 1],
      );

      return {
        opacity: progress,

        translateX: 0,
        translateY: 0,

        scale,

        rotation: 0,
      };
    }

    case 'slideUp':
      return {
        opacity: progress,

        translateX: 0,

        translateY: (1 - progress) * 120 * intensity,

        scale: 1,

        rotation: 0,
      };

    case 'slideDown':
      return {
        opacity: progress,

        translateX: 0,

        translateY: -(1 - progress) * 120 * intensity,

        scale: 1,

        rotation: 0,
      };

    case 'slideLeft':
      return {
        opacity: progress,

        translateX: (1 - progress) * 180 * intensity,

        translateY: 0,

        scale: 1,

        rotation: 0,
      };

    case 'slideRight':
      return {
        opacity: progress,

        translateX: -(1 - progress) * 180 * intensity,

        translateY: 0,

        scale: 1,

        rotation: 0,
      };

    case 'bounce': {
      const bounce = Math.sin(progress * Math.PI * 2) * (1 - progress) * 25 * intensity;

      return {
        opacity: progress,

        translateX: 0,

        translateY: -bounce,

        scale: 1,

        rotation: 0,
      };
    }

    case 'rotate':
      return {
        opacity: progress,

        translateX: 0,
        translateY: 0,

        scale: 1,

        rotation: (1 - progress) * -20 * intensity,
      };

    default:
      return {
        opacity: 1,

        translateX: 0,
        translateY: 0,

        scale: 1,

        rotation: 0,
      };
  }
}

import type { VisualBlockData } from '../blocks/blockTypes';
import type { VisualTimelineData } from '../timeline/visualTimelineTypes';
import { isBackgroundStyle } from '../background/backgroundTypes';

export type ValidationIssue = {
  path: string;
  message: string;
  severity: 'error' | 'warning';
};

export type ValidationResult<T> = {
  valid: boolean;
  data: T;
  issues: ValidationIssue[];
};

type UnknownObject = Record<string, unknown>;

type SchemaLayout = UnknownObject & {
  position?: unknown;
  offsetX?: unknown;
  offsetY?: unknown;
  scale?: unknown;
  rotation?: unknown;
};

type SchemaAnimation = UnknownObject & {
  enter?: unknown;
  exit?: unknown;
  duration?: unknown;
  exitDuration?: unknown;
  delay?: unknown;
  exitDelay?: unknown;
  intensity?: unknown;
};

type SchemaBlock = UnknownObject & {
  type?: unknown;
  layout?: SchemaLayout;
  animation?: string | SchemaAnimation;
  children?: unknown;
  duration?: unknown;
  startFrame?: unknown;
  x?: unknown;
  y?: unknown;
  scale?: number;
  rotation?: unknown;
};

type SchemaSegment = UnknownObject & {
  id?: unknown;
  blocks?: unknown[];
  background?: unknown;
};

const BLOCK_TYPES = new Set([
  'text',
  'number',
  'money',
  'badge',
  'stat',
  'metric',
  'comparison',
  'chart',
  'barChart',
  'rectangle',
  'circle',
  'line',
  'arrow',
  'bar',
  'progress',
  'image',
  'group',
  'stack',
  'overlay',
  'sequence',
]);

const POSITIONS = new Set([
  'top',
  'topLeft',
  'topRight',
  'center',
  'centerLeft',
  'centerRight',
  'bottom',
  'bottomLeft',
  'bottomRight',
]);

const ANIMATIONS = new Set([
  'none',
  'fade',
  'pop',
  'slideUp',
  'slideDown',
  'slideLeft',
  'slideRight',
  'bounce',
  'rotate',
  'minimal',
  'smooth',
  'slide',
  'dramatic',
  'attention',
]);

function isObject(value: unknown): value is UnknownObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function isAllowedString(value: unknown, allowed: Set<string>): value is string {
  return typeof value === 'string' && allowed.has(value);
}

function validateBlock(input: unknown, path: string, issues: ValidationIssue[]): VisualBlockData {
  if (!isObject(input)) {
    issues.push({
      path,
      message: 'Block must be an object',
      severity: 'error',
    });

    return {
      type: 'text',
      text: '',
    } as VisualBlockData;
  }

  const block = input as SchemaBlock;

  // Backward compatibility: normalize old icon blocks to image.
  if ((block as { type?: string }).type === 'icon') {
    block.type = 'image';
  }

  const legacyBlock = block as SchemaBlock & { icon?: unknown };
  if (legacyBlock.icon !== undefined && legacyBlock.image === undefined) {
    legacyBlock.image = legacyBlock.icon;
  }
  delete legacyBlock.icon;

  if (typeof block.type !== 'string' || !BLOCK_TYPES.has(block.type)) {
    issues.push({
      path: `${path}.type`,
      message: `Unknown block type: ${String(block.type)}`,
      severity: 'error',
    });

    block.type = 'text';
  }

  if (block.duration !== undefined) {
    if (
      typeof block.duration !== 'number' ||
      !Number.isFinite(block.duration) ||
      block.duration <= 0
    ) {
      issues.push({
        path: `${path}.duration`,
        message: 'Duration must be a positive number',
        severity: 'error',
      });

      delete block.duration;
    }
  }

  if (block.startFrame !== undefined) {
    if (
      typeof block.startFrame !== 'number' ||
      !Number.isFinite(block.startFrame) ||
      block.startFrame < 0
    ) {
      issues.push({
        path: `${path}.startFrame`,
        message: 'startFrame must be >= 0',
        severity: 'error',
      });

      delete block.startFrame;
    }
  }

  if (block.x !== undefined) {
    block.x = numberOr(block.x, 540);
  }

  if (block.y !== undefined) {
    block.y = numberOr(block.y, 960);
  }

  if (block.scale !== undefined) {
    block.scale = numberOr(block.scale, 1);

    if (block.scale <= 0) {
      issues.push({
        path: `${path}.scale`,
        message: 'Scale must be > 0',
        severity: 'error',
      });

      block.scale = 1;
    }
  }

  if (block.rotation !== undefined) {
    block.rotation = numberOr(block.rotation, 0);
  }

  if (block.layout !== undefined) {
    if (!isObject(block.layout)) {
      issues.push({
        path: `${path}.layout`,
        message: 'layout must be an object',
        severity: 'error',
      });

      delete block.layout;
    } else {
      const layout = block.layout;

      if (layout.position !== undefined && !isAllowedString(layout.position, POSITIONS)) {
        issues.push({
          path: `${path}.layout.position`,
          message: `Unknown position: ${String(layout.position)}`,
          severity: 'error',
        });

        delete layout.position;
      }

      if (layout.offsetX !== undefined) {
        layout.offsetX = numberOr(layout.offsetX, 0);
      }

      if (layout.offsetY !== undefined) {
        layout.offsetY = numberOr(layout.offsetY, 0);
      }

      if (layout.scale !== undefined) {
        layout.scale = numberOr(layout.scale, 1);
      }

      if (layout.rotation !== undefined) {
        layout.rotation = numberOr(layout.rotation, 0);
      }
    }
  }

  if (block.animation !== undefined) {
    const animation = block.animation;

    if (typeof animation === 'string') {
      if (!ANIMATIONS.has(animation)) {
        issues.push({
          path: `${path}.animation`,
          message: `Unknown animation: ${animation}`,
          severity: 'error',
        });

        block.animation = 'none';
      }
    } else if (isObject(animation)) {
      const animationObject = animation as SchemaAnimation;

      block.animation = animationObject;

      if (
        animationObject.enter !== undefined &&
        !isAllowedString(animationObject.enter, ANIMATIONS)
      ) {
        issues.push({
          path: `${path}.animation.enter`,
          message: `Unknown animation: ${String(animationObject.enter)}`,
          severity: 'error',
        });

        delete animationObject.enter;
      }

      if (
        animationObject.exit !== undefined &&
        !isAllowedString(animationObject.exit, ANIMATIONS)
      ) {
        issues.push({
          path: `${path}.animation.exit`,
          message: `Unknown animation: ${String(animationObject.exit)}`,
          severity: 'error',
        });

        delete animationObject.exit;
      }

      if (
        animationObject.duration !== undefined &&
        (typeof animationObject.duration !== 'number' ||
          !Number.isFinite(animationObject.duration) ||
          animationObject.duration <= 0)
      ) {
        issues.push({
          path: `${path}.animation.duration`,
          message: 'Animation duration must be > 0',
          severity: 'error',
        });

        delete animationObject.duration;
      }

      if (
        animationObject.exitDuration !== undefined &&
        (typeof animationObject.exitDuration !== 'number' ||
          !Number.isFinite(animationObject.exitDuration) ||
          animationObject.exitDuration <= 0)
      ) {
        issues.push({
          path: `${path}.animation.exitDuration`,
          message: 'Exit duration must be > 0',
          severity: 'error',
        });

        delete animationObject.exitDuration;
      }

      if (
        animationObject.delay !== undefined &&
        (typeof animationObject.delay !== 'number' ||
          !Number.isFinite(animationObject.delay) ||
          animationObject.delay < 0)
      ) {
        issues.push({
          path: `${path}.animation.delay`,
          message: 'Animation delay must be >= 0',
          severity: 'error',
        });

        delete animationObject.delay;
      }

      if (
        animationObject.exitDelay !== undefined &&
        (typeof animationObject.exitDelay !== 'number' ||
          !Number.isFinite(animationObject.exitDelay) ||
          animationObject.exitDelay < 0)
      ) {
        issues.push({
          path: `${path}.animation.exitDelay`,
          message: 'Exit delay must be >= 0',
          severity: 'error',
        });

        delete animationObject.exitDelay;
      }

      if (animationObject.intensity !== undefined) {
        animationObject.intensity = numberOr(animationObject.intensity, 1);

        if (typeof animationObject.intensity === 'number' && animationObject.intensity < 0) {
          animationObject.intensity = 0;
        }
      }
    } else {
      issues.push({
        path: `${path}.animation`,
        message: 'Animation must be a string or object',
        severity: 'error',
      });

      delete block.animation;
    }
  }

  if (block.children !== undefined) {
    if (!Array.isArray(block.children)) {
      issues.push({
        path: `${path}.children`,
        message: 'children must be an array',
        severity: 'error',
      });

      delete block.children;
    } else {
      block.children = block.children.map((child: unknown, index: number) =>
        validateBlock(child, `${path}.children[${index}]`, issues),
      );
    }
  }

  return block as VisualBlockData;
}

export function validateVisualTimeline(input: unknown): ValidationResult<VisualTimelineData> {
  const issues: ValidationIssue[] = [];

  if (!isObject(input)) {
    return {
      valid: false,

      data: {
        segments: [],
      } as VisualTimelineData,

      issues: [
        {
          path: '',
          message: 'Visual timeline must be an object',
          severity: 'error',
        },
      ],
    };
  }

  if (!Array.isArray(input.segments)) {
    return {
      valid: false,

      data: {
        segments: [],
      } as VisualTimelineData,

      issues: [
        {
          path: 'segments',
          message: 'segments must be an array',
          severity: 'error',
        },
      ],
    };
  }

  const segments = input.segments.map((segmentInput: unknown, segmentIndex: number) => {
    const path = `segments[${segmentIndex}]`;

    if (!isObject(segmentInput)) {
      issues.push({
        path,
        message: 'Segment must be an object',
        severity: 'error',
      });

      return {
        id: `segment-${segmentIndex}`,
        blocks: [],
      };
    }

    const segment = segmentInput as SchemaSegment;

    if (typeof segment.id !== 'string') {
      issues.push({
        path: `${path}.id`,
        message: 'Segment id must be a string',
        severity: 'error',
      });

      segment.id = `segment-${segmentIndex}`;
    }

    if (
      segment.contentOpacity !== undefined &&
      (typeof segment.contentOpacity !== 'number' ||
        !Number.isFinite(segment.contentOpacity) ||
        segment.contentOpacity < 0 ||
        segment.contentOpacity > 1)
    ) {
      issues.push({
        path: `${path}.contentOpacity`,
        message: 'Scene content opacity must be between 0 and 1',
        severity: 'error',
      });
      delete segment.contentOpacity;
    }

    if (segment.background !== undefined && !isBackgroundStyle(segment.background)) {
      issues.push({
        path: `${path}.background`,
        message: 'Scene background has an invalid style',
        severity: 'error',
      });
      delete segment.background;
    }

    if (!Array.isArray(segment.blocks)) {
      issues.push({
        path: `${path}.blocks`,
        message: 'blocks must be an array',
        severity: 'error',
      });

      segment.blocks = [];
    }

    segment.blocks = segment.blocks.map((block: unknown, blockIndex: number) =>
      validateBlock(block, `${path}.blocks[${blockIndex}]`, issues),
    );

    return segment;
  });

  return {
    valid: !issues.some((issue) => issue.severity === 'error'),

    data: {
      segments,
    } as VisualTimelineData,

    issues,
  };
}

export function normalizeVisualTimeline(input: unknown): ValidationResult<VisualTimelineData> {
  return validateVisualTimeline(input);
}

export function printValidationIssues(issues: ValidationIssue[]) {
  for (const issue of issues) {
    const prefix = issue.severity === 'error' ? 'ERROR' : 'WARNING';

    console.warn(`[${prefix}] ${issue.path}: ${issue.message}`);
  }
}

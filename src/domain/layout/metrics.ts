import type { VisualBlockData } from '../blocks/blockTypes';

export type BlockMetrics = {
  width: number;
  height: number;

  anchor: 'center' | 'topLeft' | 'topCenter' | 'centerLeft' | 'centerRight' | 'bottomCenter';
};

export function getBlockMetrics(block: VisualBlockData): BlockMetrics {
  switch (block.type) {

    case 'text': {
      const measured = measureText(block.text ?? '', block.fontSize ?? 72);
      // Text-box dimensions are explicit. Content edits update the stored
      // height in updateSelectedText; deriving it here as well would make the
      // selection frame move during pointer resizing and cause handle drift.
      return {
        width: block.width ?? measured.width,
        height: block.height ?? measured.height,
        anchor: 'center',
      };
    }

    case 'number':
      return measureNumber(block);

    case 'money':
      return measureMoney(block);

    case 'badge':
      return measureBadge(block);

    case 'stat':
      return {
        width: block.width ?? 850,
        height: block.height ?? 500,
        anchor: 'center',
      };

    case 'metric':
      // MetricBlock renders a concrete 800x400 container by default.
      // The editor bounds must use the same dimensions, otherwise the
      // selection frame cuts through the rendered metric.
      return {
        width: block.width ?? 800,
        height: block.height ?? 400,
        anchor: 'center',
      };

    case 'comparison':
      return {
        width: block.width ?? 760,
        height: block.height ?? 360,
        anchor: 'center',
      };

    case 'chart':
      return {
        width: block.width ?? 800,
        height: block.height ?? 400,
        anchor: 'center',
      };

    case 'barChart':
      return {
        width: block.width ?? 800,
        height: block.height ?? 500,
        anchor: 'center',
      };

    case 'rectangle':
      return {
        width: block.width ?? 300,
        height: block.height ?? 200,
        anchor: 'center',
      };

    case 'circle': {
      const size = block.width ?? block.height ?? 100;

      return {
        width: size,
        height: size,
        anchor: 'center',
      };
    }

    case 'line':
      return {
        width: block.width ?? 300,
        // A horizontal line needs a practical hit area for vertical resizing;
        // its visible stroke remains controlled by strokeWidth in ShapeBlock.
        height: Math.max(24, block.height ?? 0, block.strokeWidth ?? 5),
        anchor: 'center',
      };

    case 'arrow':
      return {
        width: block.width ?? 300,
        height: 80,
        anchor: 'center',
      };

    case 'bar':
      return {
        width: block.width ?? 500,
        height: block.height ?? 60,
        anchor: 'center',
      };

    case 'progress':
      return {
        width: block.width ?? 700,
        height: block.height ?? 35,
        anchor: 'center',
      };

    case 'image':
      return {
        width: block.width ?? 100,
        height: block.height ?? 100,
        anchor: 'center',
      };

    case 'group':
      return {
        width: block.width ?? 600,
        height: block.height ?? 300,
        anchor: 'center',
      };

    case 'stack':
      return {
        // Stack is a real container: its bounds must not be derived
        // from the content. Children stretch to the container width.
        width: block.width ?? 600,
        height: block.height ?? 400,
        anchor: 'center',
      };

    case 'overlay':
      return {
        width: block.width ?? 900,
        height: block.height ?? 900,
        anchor: 'center',
      };

    case 'sequence':
      return measureSequence(block.children ?? []);

    default:
      return {
        width: 400,
        height: 240,
        anchor: 'center',
      };
  }
}

function measureText(text: string, fontSize: number): BlockMetrics {
  const characterFactor = 0.68;

  const horizontalPadding = Math.max(45, fontSize * 0.2);

  const width = text.length * fontSize * characterFactor + horizontalPadding * 2;

  return {
    width: Math.min(1000, Math.max(60, width)),

    height: fontSize * 1.35 + fontSize * 0.12,

    anchor: 'center',
  };
}

function measureNumber(block: VisualBlockData): BlockMetrics {
  const fontSize = block.fontSize ?? 100;

  const from = block.from ?? 0;

  const to = block.to ?? 0;

  const maxValue = Math.max(Math.abs(from), Math.abs(to));

  const digits = Math.max(1, Math.round(maxValue).toString().length);

  const suffix = block.suffix ?? '';

  const suffixWidth = suffix.length * fontSize * 0.55;

  return {
    width: digits * fontSize * 0.65 + suffixWidth + 40,

    height: fontSize * 1.25,

    anchor: 'center',
  };
}

function measureMoney(block: VisualBlockData): BlockMetrics {
  const fontSize = block.fontSize ?? 100;

  const amount = Math.abs(block.amount ?? 0);

  const digits = Math.max(1, Math.round(amount).toString().length);

  return {
    width: digits * fontSize * 0.65 + 150,

    height: fontSize * 1.25,

    anchor: 'center',
  };
}

function measureBadge(block: VisualBlockData): BlockMetrics {
  const fontSize = block.fontSize ?? 36;
  const text = block.text ?? '';
  const borderWidth = Math.max(0, block.borderWidth ?? 0);

  // Match the rendered Badge padding instead of estimating it with fixed
  // constants. This keeps selection handles around the entire pill.
  const paddingValue = block.padding ?? '14px 24px';
  const paddingParts = String(paddingValue)
    .trim()
    .split(/\s+/)
    .map((part) => {
      const parsed = Number.parseFloat(part);
      return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    });

  let top = 0;
  let right = 0;
  let bottom = 0;
  let left = 0;

  if (paddingParts.length === 1) {
    [top] = paddingParts;
    right = bottom = left = top;
  } else if (paddingParts.length === 2) {
    [top, right] = paddingParts;
    bottom = top;
    left = right;
  } else if (paddingParts.length === 3) {
    [top, right, bottom] = paddingParts;
    left = right;
  } else if (paddingParts.length >= 4) {
    [top, right, bottom, left] = paddingParts;
  }

  // Badge uses a heavy font (800) and nowrap text. A 0.62 average is too
  // narrow for many glyphs, causing the pill to be clipped at the selection
  // frame. Use a safer width estimate and include padding + border.
  const estimatedTextWidth = text.length * fontSize * 0.72;

  return {
    width: Math.min(1000, Math.max(20, estimatedTextWidth + left + right + borderWidth * 2)),
    height: Math.max(1, fontSize + top + bottom + borderWidth * 2),
    anchor: 'center',
  };
}

function measureSequence(children: VisualBlockData[]): BlockMetrics {
  if (!children.length) {
    return {
      width: 300,
      height: 200,
      anchor: 'center',
    };
  }

  const metrics = children.map(getBlockMetrics);

  return {
    width: Math.max(...metrics.map((item) => item.width)),

    height: Math.max(...metrics.map((item) => item.height)),

    anchor: 'center',
  };
}

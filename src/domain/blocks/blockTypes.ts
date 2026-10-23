import type { AnimationValue } from '../animation/animation';

export type VisualBlockLayer = 'background' | 'image' | 'character' | 'text' | 'shape' | 'other';

export type VisualBlockData = {
  type:
    | 'text'
    | 'number'
    | 'money'
    | 'chart'
    | 'barChart'
    | 'group'
    | 'stack'
    | 'sequence'
    | 'comparison'
    | 'metric'
    | 'stat'
    | 'overlay'
    | 'rectangle'
    | 'circle'
    | 'line'
    | 'arrow'
    | 'bar'
    | 'progress'
    | 'badge'
    | 'image';

  id?: string;

  layer?: VisualBlockLayer;

  zIndex?: number;

  x?: number;
  y?: number;

  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  opacity?: number;

  layout?: {
    position?:
      | 'top'
      | 'topLeft'
      | 'topRight'
      | 'center'
      | 'centerLeft'
      | 'centerRight'
      | 'bottom'
      | 'bottomLeft'
      | 'bottomRight';

    offsetX?: number;
    offsetY?: number;

    scale?: number;
    rotation?: number;
  };

  animation?: AnimationValue;

  text?: string;

  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;

  from?: number;
  to?: number;

  suffix?: string;

  amount?: number;

  values?: number[];
  labels?: string[];

  yLabels?: string[];

  xAxisLabel?: string;
  yAxisLabel?: string;

  editorYMin?: number;
  editorYMax?: number;
  editorYSteps?: number;

  value?: number;
  max?: number;

  /** Initial and target fill percentages for bar/progress (0–100). */
  fromValue?: number;
  toValue?: number;

  /** Duration in seconds for filling bar/progress. */
  fillDuration?: number;

  stat?: {
    value: string;

    label: string;

    detail?: string;

    icon?: string;

    direction?: 'up' | 'down' | 'neutral';
  };

  metric?: {
    value: string;

    label: string;

    icon?: string;

    direction?: 'up' | 'down' | 'neutral';
  };

  comparison?: {
    left: {
      title: string;
      value: string;
    };

    right: {
      title: string;
      value: string;
    };

    arrow?: string;
  };

  image?: string;

  width?: number;
  height?: number;

  backgroundColor?: string;

  color?: string;

  textColor?: string;

  borderColor?: string;

  borderWidth?: number;

  borderRadius?: number;

  padding?: number | string;

  gap?: number;

  strokeWidth?: number;

  startFrame?: number;

  duration?: number;

  children?: VisualBlockData[];

  direction?: 'horizontal' | 'vertical';

  align?: 'start' | 'center' | 'end';

  justify?: 'start' | 'center' | 'end';

  stagger?: number;
};

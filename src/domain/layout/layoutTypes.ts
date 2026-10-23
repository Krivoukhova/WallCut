export type VisualPosition =
  | 'top'
  | 'center'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topLeft'
  | 'topRight'
  | 'centerLeft'
  | 'centerRight'
  | 'bottomLeft'
  | 'bottomRight';

export type BlockLayout = {
  position?: VisualPosition;

  offsetX?: number;
  offsetY?: number;

  scale?: number;
  rotation?: number;
};

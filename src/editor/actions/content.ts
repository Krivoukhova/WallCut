import { useCallback } from 'react';

import type { VisualBlockData } from '../../domain/blocks/blockTypes';

import type { ResolvedEditorBlock } from '../editorTypes';
import { getBlockMetrics } from '../../domain/layout/metrics';

export function useEditorContentActions(options: {
  selectedBlockId: string | null;
  selectedBlock: ResolvedEditorBlock | undefined;
  updateBlock: (editorId: string, updater: (block: VisualBlockData) => VisualBlockData) => void;
}) {
  const { selectedBlockId, selectedBlock, updateBlock } = options;

  const updateSelectedText = useCallback(
    (text: string) => {
      if (!selectedBlock) {
        return;
      }

      updateBlock(selectedBlock.editorId, (block) => {
        // Older projects may not have persisted text-box dimensions.
        // Capture the current dimensions before changing the text so a
        // newline or a short next line cannot resize the box implicitly.
        const metrics = block.type === 'text' ? getBlockMetrics(block) : null;
        if (block.type !== 'text' || !metrics) {
          return { ...block, text };
        }

        const fontSize = block.fontSize ?? 72;
        const lineHeight = fontSize * 1.2;
        const lineCount = Math.max(1, text.split('\n').length);
        const oldHeight = block.height ?? metrics.height;
        const scaleY = Math.max(0.001, Math.abs(block.scaleY ?? 1));
        // Text glyphs are not scaled by scaleY; only the text box is.
        // Store enough base height for the actual line count, accounting
        // for the existing box scale so repeated edits don't overgrow it.
        const requiredHeight = (lineCount * lineHeight) / scaleY;
        const nextHeight = Math.max(oldHeight, requiredHeight);
        const heightDelta = (nextHeight - oldHeight) * scaleY * (block.scale ?? 1);
        return {
          ...block,
          width: block.width ?? metrics.width,
          height: nextHeight,
          y: (block.y ?? 960) + heightDelta / 2,
          text,
        };
      });
    },
    [selectedBlock, updateBlock],
  );

  const updateSelectedNumberFrom = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        from: value,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedNumberTo = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        to: value,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedMoneyAmount = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        amount: value,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedMoneySuffix = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        suffix: value,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedMetricValue = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        metric: {
          ...(block.metric ?? {
            value: '',
            label: '',
            direction: 'neutral',
          }),
          value,
        },
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedMetricLabel = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        metric: {
          ...(block.metric ?? {
            value: '',
            label: '',
            direction: 'neutral',
          }),
          label: value,
        },
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedMetricIcon = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        metric: {
          ...(block.metric ?? {
            value: '',
            label: '',
            direction: 'neutral',
          }),
          icon: value,
        },
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedMetricDirection = useCallback(
    (value: 'up' | 'down' | 'neutral') => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        metric: {
          ...(block.metric ?? {
            value: '',
            label: '',
            direction: 'neutral',
          }),
          direction: value,
        },
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedStatValue = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        stat: {
          ...(block.stat ?? {
            value: '',
            label: '',
            detail: '',
            direction: 'neutral',
          }),
          value,
        },
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedStatLabel = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        stat: {
          ...(block.stat ?? {
            value: '',
            label: '',
            detail: '',
            direction: 'neutral',
          }),
          label: value,
        },
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedStatDetail = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        stat: {
          ...(block.stat ?? {
            value: '',
            label: '',
            detail: '',
            direction: 'neutral',
          }),
          detail: value,
        },
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedStatIcon = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        stat: {
          ...(block.stat ?? {
            value: '',
            label: '',
            detail: '',
            direction: 'neutral',
          }),
          icon: value,
        },
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedChartValues = useCallback(
    (values: number[]) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        values,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedChartLabels = useCallback(
    (labels: string[]) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        labels,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedChartYLabels = useCallback(
    (labels: string[]) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        yLabels: labels,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedChartXAxisLabel = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        xAxisLabel: value,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedChartYAxisLabel = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        yAxisLabel: value,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedBarChartValues = useCallback(
    (values: number[]) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        values,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedBarChartLabels = useCallback(
    (labels: string[]) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        labels,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedComparisonLeftTitle = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,

        comparison: {
          ...(block.comparison ?? {
            left: {
              title: '',
              value: '',
            },
            right: {
              title: '',
              value: '',
            },
            arrow: '→',
          }),

          left: {
            ...(block.comparison?.left ?? {
              title: '',
              value: '',
            }),

            title: value,
          },
        },
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedComparisonLeftValue = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,

        comparison: {
          ...(block.comparison ?? {
            left: {
              title: '',
              value: '',
            },
            right: {
              title: '',
              value: '',
            },
            arrow: '→',
          }),

          left: {
            ...(block.comparison?.left ?? {
              title: '',
              value: '',
            }),

            value,
          },
        },
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedComparisonRightTitle = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,

        comparison: {
          ...(block.comparison ?? {
            left: {
              title: '',
              value: '',
            },
            right: {
              title: '',
              value: '',
            },
            arrow: '→',
          }),

          right: {
            ...(block.comparison?.right ?? {
              title: '',
              value: '',
            }),

            title: value,
          },
        },
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedComparisonRightValue = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,

        comparison: {
          ...(block.comparison ?? {
            left: {
              title: '',
              value: '',
            },
            right: {
              title: '',
              value: '',
            },
            arrow: '→',
          }),

          right: {
            ...(block.comparison?.right ?? {
              title: '',
              value: '',
            }),

            value,
          },
        },
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedComparisonArrow = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,

        comparison: {
          ...(block.comparison ?? {
            left: {
              title: '',
              value: '',
            },
            right: {
              title: '',
              value: '',
            },
            arrow: '→',
          }),

          arrow: value,
        },
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedProgressValue = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        fromValue: Math.min(100, Math.max(0, value)),
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedProgressMax = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        toValue: Math.min(100, Math.max(0, value)),
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedProgressWidth = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => {
        const width = Math.max(1, value);
        const height = Math.max(1, block.height ?? 1);
        return {
          ...block,
          width,
          borderRadius: Math.min(Math.max(0, block.borderRadius ?? 0), Math.min(width, height) / 2),
        };
      });
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedProgressHeight = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => {
        const width = Math.max(1, block.width ?? 1);
        const height = Math.max(1, value);
        return {
          ...block,
          height,
          borderRadius: Math.min(Math.max(0, block.borderRadius ?? 0), Math.min(width, height) / 2),
        };
      });
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedProgressBorderRadius = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        borderRadius: Math.max(0, value),
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedProgressFillDuration = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      // Do not clamp against selectedBlock.segmentDuration here: that snapshot
      // can lag behind a scene-duration edit during the same render cycle.
      // The Inspector derives its live maximum from the current scene.
      updateBlock(selectedBlockId, (block) => ({
        ...block,
        fillDuration: Math.max(0, value),
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedBadgeText = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        text: value,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedImage = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        image: value,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedFontSize = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => {
        if (block.type !== 'text') {
          return { ...block, fontSize: value };
        }

        // Keep the text inside its editor frame when the font size changes.
        // Scale the existing box proportionally (rather than replacing it
        // with estimated metrics), preserving custom dimensions and the
        // user's manual resizing. The box is center-anchored, so x/y stay put.
        const oldFontSize = Math.max(1, block.fontSize ?? 72);
        const nextFontSize = Math.max(1, value);
        const ratio = nextFontSize / oldFontSize;
        const metrics = getBlockMetrics(block);
        const width = block.width ?? metrics.width;
        const height = block.height ?? metrics.height;

        return {
          ...block,
          fontSize: value,
          width: Math.max(1, width * ratio),
          height: Math.max(1, height * ratio),
        };
      });
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedFontWeight = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        fontWeight: value,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedFontFamily = useCallback(
    (value: string) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        fontFamily: value,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedColor = useCallback(
    (color: string) => {
      if (!selectedBlock) {
        return;
      }

      updateBlock(selectedBlock.editorId, (block) => ({
        ...block,
        color,
      }));
    },
    [selectedBlock, updateBlock],
  );

  const updateSelectedBackgroundColor = useCallback(
    (backgroundColor: string) => {
      if (!selectedBlock) {
        return;
      }

      updateBlock(selectedBlock.editorId, (block) => ({
        ...block,
        backgroundColor,
      }));
    },
    [selectedBlock, updateBlock],
  );

  return {
    updateSelectedText,
    updateSelectedNumberFrom,
    updateSelectedNumberTo,
    updateSelectedMoneyAmount,
    updateSelectedMoneySuffix,
    updateSelectedMetricValue,
    updateSelectedMetricLabel,
    updateSelectedMetricIcon,
    updateSelectedMetricDirection,
    updateSelectedStatValue,
    updateSelectedStatLabel,
    updateSelectedStatDetail,
    updateSelectedStatIcon,
    updateSelectedChartValues,
    updateSelectedChartLabels,
    updateSelectedChartYLabels,
    updateSelectedChartXAxisLabel,
    updateSelectedChartYAxisLabel,
    updateSelectedBarChartValues,
    updateSelectedBarChartLabels,
    updateSelectedComparisonLeftTitle,
    updateSelectedComparisonLeftValue,
    updateSelectedComparisonRightTitle,
    updateSelectedComparisonRightValue,
    updateSelectedComparisonArrow,
    updateSelectedProgressValue,
    updateSelectedProgressMax,
    updateSelectedProgressFillDuration,
    updateSelectedProgressWidth,
    updateSelectedProgressHeight,
    updateSelectedProgressBorderRadius,
    updateSelectedBadgeText,
    updateSelectedImage,
    updateSelectedFontSize,
    updateSelectedFontWeight,
    updateSelectedFontFamily,
    updateSelectedColor,
    updateSelectedBackgroundColor,
  };
}

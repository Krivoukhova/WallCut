import type { TTSTimeline } from '../../domain/timeline/ttsTimelineTypes';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import { useEditorHistory } from '../editorHistory';
import { useEditorActions } from '../useEditorActions';
import { useEditorScenes } from './useEditorScenes';
import { useEditorContainerChildren } from './useEditorContainerChildren';
import { useEditorBlockArrangement } from './useEditorBlockArrangement';
import { useEditorTimelineState } from './useEditorTimelineState';
import { useSelectedEditorBlock } from './useSelectedEditorBlock';

type CreateEditorInspectorPropsArgs = {
  timeline: TTSTimeline;
  selectedBlock: ReturnType<typeof useSelectedEditorBlock>;
  selectedSceneId: ReturnType<typeof useEditorScenes>['selectedSceneId'];
  setSelectedBlockId: (id: string | null) => void;
  editorVisualTimeline: VisualTimelineData;
  runtimeTimeline: ReturnType<typeof useEditorTimelineState>['runtimeTimeline'];
  sceneActions: ReturnType<typeof useEditorScenes>;
  editorActions: ReturnType<typeof useEditorActions>;
  editorHistory: ReturnType<typeof useEditorHistory>;
  containerChildActions: ReturnType<typeof useEditorContainerChildren>;
  alignSelected: ReturnType<typeof useEditorBlockArrangement>['alignSelected'];
};

/** Maps editor state and action APIs to the props consumed by the Inspector. */
export function createEditorInspectorProps({
  timeline,
  selectedBlock,
  selectedSceneId,
  setSelectedBlockId,
  editorVisualTimeline,
  runtimeTimeline,
  sceneActions,
  editorActions,
  editorHistory,
  containerChildActions,
  alignSelected,
}: CreateEditorInspectorPropsArgs) {
  const {
    reorderScenes,
    setSceneName,
    setSceneDuration,
    setSceneBackground,
    setSceneContentOpacity,
  } = sceneActions;
  const { beginTextEdit, endTextEdit, beginInspectorEdit, endInspectorEdit, beginColorEdit } =
    editorHistory;
  const { addSelectedContainerChild, updateStackChildText } = containerChildActions;
  const {
    updateSelectedText,
    updateSelectedNumberFrom,
    updateSelectedNumberTo,
    updateSelectedMoneyAmount,
    updateSelectedMoneySuffix,
    updateSelectedMetricValue,
    updateSelectedMetricLabel,
    updateSelectedMetricIcon,
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
    updateSelectedLayer,
    updateSelectedZIndex,
    updateSelectedColor,
    updateSelectedBackgroundColor,
    updateSelectedPosition,
    updateSelectedOpacity,
    updateSelectedStartFrame,
    updateSelectedDuration,
    updateSelectedScale,
    updateSelectedScaleX,
    updateSelectedScaleY,
    updateSelectedRotation,
    moveSelectedForward,
    moveSelectedBackward,
    bringSelectedToFront,
    sendSelectedToBack,
    updateSelectedAnimationPreset,
    updateSelectedAnimationEnter,
    updateSelectedAnimationExit,
    updateSelectedAnimationDuration,
    updateSelectedAnimationExitDuration,
    updateSelectedAnimationDelay,
    updateSelectedAnimationExitDelay,
    updateSelectedAnimationIntensity,
  } = editorActions;

  return {
    fps: timeline.fps,
    selectedBlock,
    onAlignSelected: alignSelected,
    selectedSceneId,
    selectedScene:
      editorVisualTimeline.segments.find((segment) => segment.id === selectedSceneId) ?? null,
    selectedSceneRuntime:
      runtimeTimeline.segments.find((segment) => segment.id === selectedSceneId) ?? null,
    reorderScenes,
    onSceneNameChange: setSceneName,
    onSceneDurationChange: setSceneDuration,
    onSceneBackgroundChange: setSceneBackground,
    onSceneContentOpacityChange: setSceneContentOpacity,

    onSelectChild: setSelectedBlockId,
    onAddChild: addSelectedContainerChild,
    onStackChildTextChange: updateStackChildText,

    onTextChange: updateSelectedText,

    onTextFocus: beginTextEdit,

    onTextBlur: endTextEdit,

    onNumberFromChange: updateSelectedNumberFrom,

    onNumberToChange: updateSelectedNumberTo,

    onNumberSuffixChange: updateSelectedMoneySuffix,

    onMoneyAmountChange: updateSelectedMoneyAmount,

    onMoneySuffixChange: updateSelectedMoneySuffix,

    onMetricValueChange: updateSelectedMetricValue,

    onMetricLabelChange: updateSelectedMetricLabel,

    onMetricIconChange: updateSelectedMetricIcon,


    onStatValueChange: updateSelectedStatValue,

    onStatLabelChange: updateSelectedStatLabel,

    onStatDetailChange: updateSelectedStatDetail,

    onStatIconChange: updateSelectedStatIcon,

    onChartValuesChange: updateSelectedChartValues,

    onChartLabelsChange: updateSelectedChartLabels,

    onChartYLabelsChange: updateSelectedChartYLabels,

    onChartXAxisLabelChange: updateSelectedChartXAxisLabel,

    onChartYAxisLabelChange: updateSelectedChartYAxisLabel,

    onBarChartValuesChange: updateSelectedBarChartValues,

    onBarChartLabelsChange: updateSelectedBarChartLabels,

    onComparisonLeftTitleChange: updateSelectedComparisonLeftTitle,

    onComparisonLeftValueChange: updateSelectedComparisonLeftValue,

    onComparisonRightTitleChange: updateSelectedComparisonRightTitle,

    onComparisonRightValueChange: updateSelectedComparisonRightValue,

    onComparisonArrowChange: updateSelectedComparisonArrow,

    onProgressValueChange: updateSelectedProgressValue,

    onProgressMaxChange: updateSelectedProgressMax,

    onProgressFillDurationChange: updateSelectedProgressFillDuration,
    onProgressWidthChange: updateSelectedProgressWidth,
    onProgressHeightChange: updateSelectedProgressHeight,
    onProgressBorderRadiusChange: updateSelectedProgressBorderRadius,

    onBadgeTextChange: updateSelectedBadgeText,

    onImageChange: updateSelectedImage,

    onFontSizeChange: updateSelectedFontSize,

    onFontWeightChange: updateSelectedFontWeight,

    onFontFamilyChange: updateSelectedFontFamily,

    onColorChange: updateSelectedColor,

    onColorPreview: updateSelectedColor,

    onColorStart: beginColorEdit,

    onBackgroundColorChange: updateSelectedBackgroundColor,

    onBackgroundColorPreview: updateSelectedBackgroundColor,

    onBackgroundColorStart: beginColorEdit,

    onXChange: (value: number) => updateSelectedPosition('x', value),

    onYChange: (value: number) => updateSelectedPosition('y', value),

    onStartFrameChange: updateSelectedStartFrame,

    onDurationChange: updateSelectedDuration,

    onScaleChange: updateSelectedScale,

    onScaleXChange: updateSelectedScaleX,

    onScaleYChange: updateSelectedScaleY,

    onRotationChange: updateSelectedRotation,

    onOpacityChange: updateSelectedOpacity,

    onInspectorFocus: beginInspectorEdit,

    onInspectorBlur: endInspectorEdit,

    onLayerChange: updateSelectedLayer,

    onZIndexChange: updateSelectedZIndex,

    onAnimationPresetChange: updateSelectedAnimationPreset,

    onAnimationEnterChange: updateSelectedAnimationEnter,

    onAnimationExitChange: updateSelectedAnimationExit,

    onAnimationDurationChange: updateSelectedAnimationDuration,

    onAnimationExitDurationChange: updateSelectedAnimationExitDuration,

    onAnimationDelayChange: updateSelectedAnimationDelay,

    onAnimationExitDelayChange: updateSelectedAnimationExitDelay,

    onAnimationIntensityChange: updateSelectedAnimationIntensity,

    onMoveForward: moveSelectedForward,

    onMoveBackward: moveSelectedBackward,

    onBringToFront: bringSelectedToFront,

    onSendToBack: sendSelectedToBack,
  };
}

import React from 'react';
import type { BackgroundStyle } from '../domain/background/backgroundTypes';
import { DEFAULT_BACKGROUND } from '../domain/background/backgroundTypes';
import { BackgroundControls } from './components/BackgroundControls';
import { uiText } from '../domain/i18n/uiText';

import type { AnimationType, AnimationPreset } from '../domain/animation/animation';

import type { ResolvedEditorBlock } from './editorTypes';

import type { VisualBlockData, VisualBlockLayer } from '../domain/blocks/blockTypes';

import { useI18n } from './i18n/I18nContext';

import { AnimationInspector } from './components/inspector/AnimationInspector';

import { BlockContentInspector } from './components/inspector/BlockContentInspector';

import { InspectorLayerSection } from './components/inspector/InspectorLayerSection';

import { InspectorTransformSection } from './components/inspector/InspectorTransformSection';

import { InspectorTimingSection } from './components/inspector/InspectorTimingSection';

import { InspectorAppearanceSection } from './components/inspector/InspectorAppearanceSection';

import { InspectorSection } from './components/inspector/InspectorSection';

import { NumberInput } from './components/inspector/InspectorInputs';

import { StackAddControl } from './components/inspector/StackAddControl';

type EditorInspectorProps = {
  fps: number;
  selectedBlock: ResolvedEditorBlock | undefined;

  selectedSceneId?: string | null;
  selectedScene?: {
    id: string;
    name?: string;
    blocks: VisualBlockData[];
    durationFrames?: number;
    background?: BackgroundStyle;
    contentOpacity?: number;
  } | null;
  selectedSceneRuntime?: {
    startFrame: number;
    durationFrames: number;
  } | null;
  onSceneNameChange?: (sceneId: string, name: string) => void;
  onSceneDurationChange?: (sceneId: string, durationFrames: number) => void;
  projectBackground?: BackgroundStyle;
  onProjectBackgroundChange?: (background: BackgroundStyle) => void;
  onSceneBackgroundChange?: (sceneId: string, background: BackgroundStyle | undefined) => void;
  onSceneContentOpacityChange?: (sceneId: string, opacity: number) => void;

  onSelectChild?: (id: string) => void;
  onAddChild?: (type: VisualBlockData['type']) => void;
  onStackChildTextChange?: (childId: string, text: string) => void;

  onTextChange: (text: string) => void;
  onTextFocus: () => void;
  onTextBlur: () => void;

  onNumberFromChange: (value: number) => void;

  onNumberToChange: (value: number) => void;

  onNumberSuffixChange: (value: string) => void;

  onMoneyAmountChange: (value: number) => void;

  onMoneySuffixChange: (value: string) => void;

  onMetricValueChange: (value: string) => void;

  onMetricLabelChange: (value: string) => void;

  onMetricIconChange: (value: string) => void;


  onStatValueChange: (value: string) => void;

  onStatLabelChange: (value: string) => void;

  onStatDetailChange: (value: string) => void;

  onStatIconChange: (value: string) => void;

  onChartValuesChange: (values: number[]) => void;

  onChartLabelsChange: (labels: string[]) => void;

  onChartYLabelsChange: (labels: string[]) => void;

  onChartXAxisLabelChange: (value: string) => void;

  onChartYAxisLabelChange: (value: string) => void;

  onBarChartValuesChange: (values: number[]) => void;

  onBarChartLabelsChange: (labels: string[]) => void;

  onComparisonLeftTitleChange: (value: string) => void;

  onComparisonLeftValueChange: (value: string) => void;

  onComparisonRightTitleChange: (value: string) => void;

  onComparisonRightValueChange: (value: string) => void;

  onComparisonArrowChange: (value: string) => void;

  onProgressValueChange: (value: number) => void;

  onProgressMaxChange: (value: number) => void;

  onProgressFillDurationChange: (value: number) => void;

  onProgressWidthChange: (value: number) => void;
  onProgressHeightChange: (value: number) => void;
  onProgressBorderRadiusChange: (value: number) => void;

  onBadgeTextChange: (value: string) => void;

  onImageChange: (value: string) => void;

  onZIndexChange: (zIndex: number) => void;

  onFontSizeChange: (value: number) => void;

  onFontWeightChange: (value: number) => void;

  onFontFamilyChange: (value: string) => void;

  onColorPreview: (color: string) => void;

  onColorChange: (color: string) => void;

  onColorStart: () => void;

  onBackgroundColorPreview: (color: string) => void;

  onBackgroundColorChange: (color: string) => void;

  onBackgroundColorStart: () => void;

  onLayerChange: (layer: VisualBlockLayer) => void;

  onMoveForward: () => void;
  onMoveBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;

  onXChange: (value: number) => void;

  onAlignSelected: (mode: 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom') => void;

  onYChange: (value: number) => void;

  onStartFrameChange: (value: number) => void;

  onDurationChange: (value: number) => void;

  onScaleChange: (value: number) => void;

  onScaleXChange: (value: number) => void;

  onScaleYChange: (value: number) => void;

  onRotationChange: (value: number) => void;

  onOpacityChange: (value: number) => void;

  onAnimationPresetChange: (value: AnimationPreset) => void;

  onAnimationEnterChange: (value: AnimationType) => void;

  onAnimationExitChange: (value: AnimationType) => void;

  onAnimationDurationChange: (value: number) => void;

  onAnimationExitDurationChange: (value: number) => void;

  onAnimationDelayChange: (value: number) => void;

  onAnimationExitDelayChange: (value: number) => void;

  onAnimationIntensityChange: (value: number) => void;

  onInspectorFocus: () => void;
  onInspectorBlur: () => void;
};

export const EditorInspector: React.FC<EditorInspectorProps> = ({
  fps,
  selectedBlock,
  selectedScene,
  selectedSceneRuntime,
  onSceneNameChange,
  onSceneDurationChange,
  projectBackground,
  onProjectBackgroundChange,
  onSceneBackgroundChange,
  onSceneContentOpacityChange,
  onSelectChild,
  onAddChild,

  onTextChange,
  onTextFocus,
  onTextBlur,

  onNumberFromChange,
  onNumberToChange,
  onNumberSuffixChange,

  onMoneyAmountChange,
  onMoneySuffixChange,

  onMetricValueChange,
  onMetricLabelChange,
  onMetricIconChange,

  onStatValueChange,
  onStatLabelChange,
  onStatDetailChange,
  onStatIconChange,

  onChartValuesChange,
  onChartLabelsChange,
  onChartYLabelsChange,
  onChartXAxisLabelChange,
  onChartYAxisLabelChange,

  onBarChartValuesChange,
  onBarChartLabelsChange,

  onComparisonLeftTitleChange,
  onComparisonLeftValueChange,
  onComparisonRightTitleChange,
  onComparisonRightValueChange,
  onComparisonArrowChange,

  onProgressValueChange,
  onProgressMaxChange,
  onProgressFillDurationChange,
  onProgressWidthChange,
  onProgressHeightChange,
  onProgressBorderRadiusChange,

  onBadgeTextChange,

  onImageChange,

  onZIndexChange,
  onFontSizeChange,
  onFontWeightChange,
  onFontFamilyChange,

  onColorPreview,
  onColorChange,
  onColorStart,

  onBackgroundColorPreview,
  onBackgroundColorChange,
  onBackgroundColorStart,

  onLayerChange,
  onMoveForward,
  onMoveBackward,
  onBringToFront,
  onSendToBack,

  onXChange,
  onAlignSelected,
  onYChange,

  onStartFrameChange,
  onDurationChange,

  onScaleChange,
  onScaleXChange,
  onScaleYChange,

  onRotationChange,
  onOpacityChange,

  onAnimationPresetChange,
  onAnimationEnterChange,
  onAnimationExitChange,
  onAnimationDurationChange,
  onAnimationExitDurationChange,
  onAnimationDelayChange,
  onAnimationExitDelayChange,
  onAnimationIntensityChange,

  onInspectorFocus,
  onInspectorBlur,
}) => {
  const { translations: t, language } = useI18n();

  const block = selectedBlock?.block;

  const children = block?.children ?? [];

  const blockTypeLabels: Record<string, string> = {
    text: t.library.text,
    number: t.library.number,
    money: t.library.money,
    metric: t.library.metric,
    stat: t.library.stat,

    chart: t.library.chart,
    barChart: t.library.barChart,
    comparison: t.library.comparison,

    group: t.library.group,
    stack: t.library.stack,
    sequence: t.library.sequence,

    rectangle: t.library.rectangle,
    circle: t.library.circle,
    line: t.library.line,
    arrow: t.library.arrow,
    bar: t.library.bar,
    progress: t.library.progress,
    badge: t.library.badge,
    image: t.library.image,
  };

  const childTypeLabels: Record<string, string> = blockTypeLabels;

  return (
    <div
      className="fs-editor-inspector"
      style={{
        width: 280,

        flex: '1 1 0',
        minWidth: 0,
        minHeight: 0,
        height: '100%',

        borderLeft: '1px solid #333',
        borderRadius: '9px 0 0 9px',
        background: '#202020',

        padding: 16,
        boxSizing: 'border-box',

        overflowY: 'auto',
        overflowX: 'hidden',

        overscrollBehavior: 'contain',
      }}
    >
      {}

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        {t.editor.inspector}
      </div>

      {}

      {selectedScene && !selectedBlock ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <InspectorSection title={uiText(language, 'videoBackground')} defaultOpen={false}>
            <BackgroundControls
              value={projectBackground ?? DEFAULT_BACKGROUND}
              onChange={(background) => onProjectBackgroundChange?.(background)}
              label={uiText(language, 'overallBackground')}
            />
          </InspectorSection>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              width: 'fit-content',
              padding: '4px 8px',
              borderRadius: 5,
              background: '#2b2b2b',
              color: '#aaa',
              fontSize: 10,
            }}
          >
            {t.sceneInspector.scene}
          </div>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: 11,
              color: '#aaa',
            }}
          >
            {t.sceneInspector.name}
            <input
              type="text"
              value={selectedScene.name ?? ''}
              onChange={(event) => onSceneNameChange?.(selectedScene.id, event.target.value)}
              onFocus={onInspectorFocus}
              onBlur={onInspectorBlur}
              placeholder={t.sceneInspector.namePlaceholder}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 9px',
                borderRadius: 6,
                border: '1px solid #444',
                background: '#171717',
                color: '#fff',
                outline: 'none',
              }}
            />
          </label>

          <InspectorSection title={uiText(language, 'sceneBackground')} defaultOpen={true}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#aaa',
                fontSize: 11,
                marginBottom: 10,
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(selectedScene.background)}
                onChange={(event) =>
                  onSceneBackgroundChange?.(
                    selectedScene.id,
                    event.target.checked ? (projectBackground ?? DEFAULT_BACKGROUND) : undefined,
                  )
                }
              />
              {uiText(language, 'useSceneBackground')}
            </label>
            {selectedScene.background && (
              <BackgroundControls
                value={selectedScene.background}
                onChange={(background) => onSceneBackgroundChange?.(selectedScene.id, background)}
                label={uiText(language, 'selectedSceneBackground')}
              />
            )}
            {!selectedScene.background && (
              <div style={{ color: '#777', fontSize: 11, lineHeight: 1.4 }}>
                {uiText(language, 'inheritVideoBackground')}
              </div>
            )}
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                color: '#aaa',
                fontSize: 11,
                marginTop: 12,
              }}
            >
              {uiText(language, 'sceneContentOpacity')}:{' '}
              {Math.round((selectedScene.contentOpacity ?? 1) * 100)}%
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round((selectedScene.contentOpacity ?? 1) * 100)}
                onChange={(event) =>
                  onSceneContentOpacityChange?.(selectedScene.id, Number(event.target.value) / 100)
                }
                style={{ width: '100%', accentColor: '#60a5fa' }}
              />
            </label>
          </InspectorSection>

          <NumberInput
            label={t.sceneInspector.durationSeconds}
            value={
              (selectedSceneRuntime?.durationFrames ?? selectedScene.durationFrames ?? 150) / 30
            }
            min={0.5}
            step={0.1}
            onChange={(value) => {
              if (Number.isFinite(value) && value > 0) {
                onSceneDurationChange?.(selectedScene.id, Math.round(value * 30));
              }
            }}
            onFocus={onInspectorFocus}
            onBlur={onInspectorBlur}
          />

          <InspectorSection title={t.sceneInspector.position} defaultOpen={true}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
              <div style={{ color: '#777' }}>{t.sceneInspector.start}</div>
              <div>
                {((selectedSceneRuntime?.startFrame ?? 0) / 30).toFixed(1)}{' '}
                {t.sceneInspector.secondsShort}
              </div>
              <div style={{ color: '#777' }}>{t.sceneInspector.end}</div>
              <div>
                {(
                  ((selectedSceneRuntime?.startFrame ?? 0) +
                    (selectedSceneRuntime?.durationFrames ?? selectedScene.durationFrames ?? 150)) /
                  30
                ).toFixed(1)}{' '}
                {t.sceneInspector.secondsShort}
              </div>
              <div style={{ color: '#777' }}>{t.sceneInspector.blocks}</div>
              <div>{selectedScene.blocks.length}</div>
            </div>
          </InspectorSection>
        </div>
      ) : !selectedBlock || !block ? (
        <div
          style={{
            color: '#777',
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          {t.editor.selectObject}
          <br />
          {t.editor.selectObjectHint}
        </div>
      ) : (
        <>
          {}

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',

              padding: '4px 8px',

              borderRadius: 5,

              background: '#2b2b2b',
              color: '#aaa',

              fontSize: 10,

              marginBottom: 14,
            }}
          >
            {blockTypeLabels[block.type] ?? block.type}
          </div>

          {}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {}

            {block.type !== 'group' && block.type !== 'stack' && (
              <InspectorSection title={t.inspector.content} defaultOpen={true}>
                <BlockContentInspector
                  block={block}
                  onTextChange={onTextChange}
                  onTextFocus={onTextFocus}
                  onTextBlur={onTextBlur}
                  onNumberFromChange={onNumberFromChange}
                  onNumberToChange={onNumberToChange}
                  onNumberSuffixChange={onNumberSuffixChange}
                  onMoneyAmountChange={onMoneyAmountChange}
                  onMoneySuffixChange={onMoneySuffixChange}
                  onMetricValueChange={onMetricValueChange}
                  onMetricLabelChange={onMetricLabelChange}
                  onMetricIconChange={onMetricIconChange}
                  onStatValueChange={onStatValueChange}
                  onStatLabelChange={onStatLabelChange}
                  onStatDetailChange={onStatDetailChange}
                  onStatIconChange={onStatIconChange}
                  onChartValuesChange={onChartValuesChange}
                  onChartLabelsChange={onChartLabelsChange}
                  onChartYLabelsChange={onChartYLabelsChange}
                  onChartXAxisLabelChange={onChartXAxisLabelChange}
                  onChartYAxisLabelChange={onChartYAxisLabelChange}
                  onBarChartValuesChange={onBarChartValuesChange}
                  onBarChartLabelsChange={onBarChartLabelsChange}
                  onComparisonLeftTitleChange={onComparisonLeftTitleChange}
                  onComparisonLeftValueChange={onComparisonLeftValueChange}
                  onComparisonRightTitleChange={onComparisonRightTitleChange}
                  onComparisonRightValueChange={onComparisonRightValueChange}
                  onComparisonArrowChange={onComparisonArrowChange}
                  onProgressValueChange={onProgressValueChange}
                  onProgressMaxChange={onProgressMaxChange}
                  onProgressFillDurationChange={onProgressFillDurationChange}
                  onProgressWidthChange={onProgressWidthChange}
                  onProgressHeightChange={onProgressHeightChange}
                  onProgressBorderRadiusChange={onProgressBorderRadiusChange}
                  onBadgeTextChange={onBadgeTextChange}
                  onImageChange={onImageChange}
                  onInspectorFocus={onInspectorFocus}
                  onInspectorBlur={onInspectorBlur}
                />
              </InspectorSection>
            )}

            {(block.type === 'group' || block.type === 'stack') && (
              <InspectorSection title={t.inspector.content} defaultOpen={true}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  {children.map((child, index) => {
                    const childId = child.id ?? `${child.type}-${index}`;
                    const editorId = `${selectedBlock!.segmentId}:${block.id}/${childId}`;

                    if (block.type === 'stack') {
                      return (
                        <button
                          key={editorId}
                          type="button"
                          onClick={() => onSelectChild?.(editorId)}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '8px 10px',
                            border: '1px solid #3a3a3a',
                            borderRadius: 5,
                            background: '#292929',
                            color: '#ddd',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: 11,
                          }}
                        >
                          {child.type === 'text'
                            ? child.text?.trim() || `${uiText(language, 'row')} ${index + 1}`
                            : `${childTypeLabels[child.type] ?? child.type} #${index + 1}`}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={editorId}
                        type="button"
                        onClick={() => onSelectChild?.(editorId)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 9px',
                          border: '1px solid #3a3a3a',
                          borderRadius: 5,
                          background: '#292929',
                          color: '#ddd',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: 11,
                        }}
                      >
                        <span>{childTypeLabels[child.type] ?? child.type}</span>
                        <span style={{ color: '#777' }}>#{index + 1}</span>
                      </button>
                    );
                  })}

                  {block.type === 'stack' ? (
                    <StackAddControl onAddChild={onAddChild} />
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: 4,
                        marginTop: 2,
                      }}
                    >
                      {(
                        [
                          ['text', t.library.text],
                          ['number', t.library.number],
                          ['money', t.library.money],
                          ['image', t.library.image],
                        ] as const
                      ).map(([type, label]) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => onAddChild?.(type)}
                          title={`+ ${label}`}
                          style={{
                            minWidth: 0,
                            padding: '5px 6px',
                            border: '1px solid #444',
                            borderRadius: 5,
                            background: '#252525',
                            color: '#bbb',
                            cursor: 'pointer',
                            fontSize: 10,
                          }}
                        >
                          + {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </InspectorSection>
            )}

            <InspectorSection title={t.inspector.animation} defaultOpen={true}>
              <AnimationInspector
                fps={fps}
                animation={block.animation}
                onAnimationPresetChange={onAnimationPresetChange}
                onAnimationEnterChange={onAnimationEnterChange}
                onAnimationExitChange={onAnimationExitChange}
                onAnimationDurationChange={onAnimationDurationChange}
                onAnimationExitDurationChange={onAnimationExitDurationChange}
                onAnimationDelayChange={onAnimationDelayChange}
                onAnimationExitDelayChange={onAnimationExitDelayChange}
                onAnimationIntensityChange={onAnimationIntensityChange}
                onFocus={onInspectorFocus}
                onBlur={onInspectorBlur}
              />
            </InspectorSection>

            {}

            <InspectorSection title={t.inspector.layer} defaultOpen={true}>
              <InspectorLayerSection
                block={block}
                onZIndexChange={onZIndexChange}
                onLayerChange={onLayerChange}
                onMoveForward={onMoveForward}
                onMoveBackward={onMoveBackward}
                onBringToFront={onBringToFront}
                onSendToBack={onSendToBack}
              />
            </InspectorSection>

            {}

            <InspectorSection title={t.inspector.appearance} defaultOpen={true}>
              <InspectorAppearanceSection
                color={block.color ?? block.textColor ?? '#ffffff'}
                backgroundColor={block.backgroundColor ?? '#1b1b1b'}
                fontSize={block.fontSize ?? 48}
                fontWeight={block.fontWeight ?? 400}
                fontFamily={
                  ['text', 'number', 'money'].includes(block.type)
                    ? (block.fontFamily ?? 'Arial, sans-serif')
                    : undefined
                }
                onFontSizeChange={onFontSizeChange}
                onFontWeightChange={onFontWeightChange}
                onFontFamilyChange={onFontFamilyChange}
                onColorPreview={onColorPreview}
                onColorChange={onColorChange}
                onColorStart={onColorStart}
                onBackgroundColorPreview={onBackgroundColorPreview}
                onBackgroundColorChange={onBackgroundColorChange}
                onBackgroundColorStart={onBackgroundColorStart}
                onFocus={onInspectorFocus}
                onBlur={onInspectorBlur}
              />
            </InspectorSection>

            {}

            <InspectorSection title={t.inspector.transform} defaultOpen={true}>
              <InspectorTransformSection
                block={block}
                onXChange={onXChange}
                onAlignSelected={onAlignSelected}
                onYChange={onYChange}
                onScaleChange={onScaleChange}
                onScaleXChange={onScaleXChange}
                onScaleYChange={onScaleYChange}
                onRotationChange={onRotationChange}
                onOpacityChange={onOpacityChange}
              />
            </InspectorSection>

            {}

            <InspectorSection title={t.inspector.timing} defaultOpen={true}>
              <InspectorTimingSection
                block={block}
                onStartFrameChange={onStartFrameChange}
                onDurationChange={onDurationChange}
              />
            </InspectorSection>
          </div>

          {}

          <div
            style={{
              marginTop: 12,

              paddingTop: 12,

              borderTop: '1px solid #333',

              display: 'flex',
              flexDirection: 'column',

              gap: 5,

              fontSize: 10,
              color: '#777',
            }}
          >
            <div>
              {t.editor.position}: {Math.round(selectedBlock.x)} × {Math.round(selectedBlock.y)}
            </div>

            <div>
              {t.editor.size}: {Math.round(selectedBlock.width)} ×{' '}
              {Math.round(selectedBlock.height)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

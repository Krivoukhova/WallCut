import { uiText } from '../../../domain/i18n/uiText';
import React from 'react';

import type { ResolvedEditorBlock } from '../../editorTypes';

import { NumberInput, TextInput, SelectInput, ArrayInput } from './InspectorInputs';

import { useI18n } from '../../i18n/I18nContext';

type ImageUploadFieldProps = {
  value: string;
  label: string;
  uploadLabel: string;
  replaceLabel: string;
  removeLabel: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
};

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  label,
  uploadLabel,
  replaceLabel,
  removeLabel,
  onChange,
  onFocus,
  onBlur,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const isImage = value.startsWith('data:image/');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== 'string') {
        return;
      }

      onChange(result);
      onBlur();

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    onFocus();
    inputRef.current?.click();
  };

  const handleRemove = () => {
    onFocus();
    onChange('');
    onBlur();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {label}
      </div>

      {isImage && (
        <div
          style={{
            width: '100%',
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @remotion/warn-native-media-tag */}
          <img
            src={value}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <button
        type="button"
        onClick={handleUploadClick}
        style={{
          width: '100%',
          minHeight: 36,
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.16)',
          background: 'rgba(255,255,255,0.06)',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        {isImage ? replaceLabel : uploadLabel}
      </button>

      {isImage && (
        <button
          type="button"
          onClick={handleRemove}
          style={{
            width: '100%',
            minHeight: 32,
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          {removeLabel}
        </button>
      )}
    </div>
  );
};

type BlockContentInspectorProps = {
  block: ResolvedEditorBlock['block'];

  // TEXT
  onTextChange: (text: string) => void;
  onTextFocus: () => void;
  onTextBlur: () => void;

  // NUMBER
  onNumberFromChange: (value: number) => void;
  onNumberToChange: (value: number) => void;
  onNumberSuffixChange: (value: string) => void;

  // MONEY
  onMoneyAmountChange: (value: number) => void;
  onMoneySuffixChange: (value: string) => void;

  // METRIC
  onMetricValueChange: (value: string) => void;
  onMetricLabelChange: (value: string) => void;
  onMetricIconChange: (value: string) => void;

  // STAT
  onStatValueChange: (value: string) => void;
  onStatLabelChange: (value: string) => void;
  onStatDetailChange: (value: string) => void;
  onStatIconChange: (value: string) => void;

  // CHART
  onChartValuesChange: (values: number[]) => void;

  onChartLabelsChange: (labels: string[]) => void;

  onChartYLabelsChange: (labels: string[]) => void;

  onChartXAxisLabelChange: (value: string) => void;

  onChartYAxisLabelChange: (value: string) => void;

  // BAR CHART
  onBarChartValuesChange: (values: number[]) => void;

  onBarChartLabelsChange: (labels: string[]) => void;

  // COMPARISON
  onComparisonLeftTitleChange: (value: string) => void;

  onComparisonLeftValueChange: (value: string) => void;

  onComparisonRightTitleChange: (value: string) => void;

  onComparisonRightValueChange: (value: string) => void;

  onComparisonArrowChange: (value: string) => void;

  // PROGRESS
  onProgressValueChange: (value: number) => void;

  onProgressMaxChange: (value: number) => void;

  onProgressFillDurationChange: (value: number) => void;

  onProgressWidthChange: (value: number) => void;
  onProgressHeightChange: (value: number) => void;
  onProgressBorderRadiusChange: (value: number) => void;

  // BADGE
  onBadgeTextChange: (value: string) => void;

  // IMAGE
  onImageChange: (value: string) => void;

  // HISTORY
  onInspectorFocus: () => void;
  onInspectorBlur: () => void;
};

const parseNumberArray = (value: string): number[] => {
  return value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
};

const parseStringArray = (value: string): string[] => {
  return value.split(',').map((item) => item.trim());
};

export const BlockContentInspector: React.FC<BlockContentInspectorProps> = ({
  block,

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

  onInspectorFocus,
  onInspectorBlur,
}) => {
  const { translations: t, language } = useI18n();


  return (
    <>
      {}
      {block.type === 'text' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: '#999',
            }}
          >
            {t.content.text}
          </div>

          <textarea
            value={block.text ?? ''}
            rows={4}
            onFocus={onTextFocus}
            // Keep Enter inside the text editor so it inserts a newline instead
            // of triggering a parent editor shortcut. Do not preventDefault:
            // the textarea's native newline behavior should remain intact.
            onKeyDown={(event) => event.stopPropagation()}
            onChange={(event) => onTextChange(event.target.value)}
            onBlur={onTextBlur}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: 8,
              border: '1px solid #444',
              borderRadius: 5,
              background: '#181818',
              color: '#fff',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: 12,
            }}
          />
        </div>
      )}

      {}
      {block.type === 'number' && (
        <>
          <NumberInput
            label={t.content.numberFrom}
            value={block.from ?? 0}
            onFocus={onInspectorFocus}
            onChange={onNumberFromChange}
            onBlur={onInspectorBlur}
          />

          <NumberInput
            label={t.content.numberTo}
            value={block.to ?? 0}
            onFocus={onInspectorFocus}
            onChange={onNumberToChange}
            onBlur={onInspectorBlur}
          />
          <TextInput
            label={t.content.numberSuffix}
            value={block.suffix ?? ''}
            onFocus={onInspectorFocus}
            onChange={onNumberSuffixChange}
            onBlur={onInspectorBlur}
            placeholder="%"
          />
        </>
      )}

      {}
      {block.type === 'money' && (
        <>
          <NumberInput
            label={t.content.moneyAmount}
            value={block.amount ?? 0}
            onFocus={onInspectorFocus}
            onChange={onMoneyAmountChange}
            onBlur={onInspectorBlur}
          />

          <SelectInput
            label={t.content.moneyCurrency}
            value={
              block.suffix === '₽' || block.suffix === '$' || block.suffix === '€'
                ? block.suffix
                : 'custom'
            }
            options={[
              {
                value: '₽',
                label: '₽',
              },
              {
                value: '$',
                label: '$',
              },
              {
                value: '€',
                label: '€',
              },
              {
                value: 'custom',
                label: t.content.moneyCustom,
              },
            ]}
            onFocus={onInspectorFocus}
            onChange={(value) => {
              if (value === 'custom') {
                onMoneySuffixChange('');
                return;
              }

              onMoneySuffixChange(value);
            }}
            onBlur={onInspectorBlur}
          />

          {!['₽', '$', '€'].includes(block.suffix ?? '') && (
            <TextInput
              label={t.content.moneyCustomSuffix}
              value={block.suffix ?? ''}
              onFocus={onInspectorFocus}
              onChange={onMoneySuffixChange}
              onBlur={onInspectorBlur}
            />
          )}
        </>
      )}

      {}
      {block.type === 'metric' && block.metric && (
        <>
          <TextInput
            label={t.content.value}
            value={block.metric.value}
            onFocus={onInspectorFocus}
            onChange={onMetricValueChange}
            onBlur={onInspectorBlur}
          />

          <TextInput
            label={t.content.label}
            value={block.metric.label}
            onFocus={onInspectorFocus}
            onChange={onMetricLabelChange}
            onBlur={onInspectorBlur}
          />

          <TextInput
            label={t.content.icon}
            value={block.metric.icon ?? ''}
            onFocus={onInspectorFocus}
            onChange={onMetricIconChange}
            onBlur={onInspectorBlur}
          />
        </>
      )}

      {}
      {block.type === 'stat' && block.stat && (
        <>
          <TextInput
            label={t.content.value}
            value={block.stat.value}
            onFocus={onInspectorFocus}
            onChange={onStatValueChange}
            onBlur={onInspectorBlur}
          />

          <TextInput
            label={t.content.label}
            value={block.stat.label}
            onFocus={onInspectorFocus}
            onChange={onStatLabelChange}
            onBlur={onInspectorBlur}
          />

          <TextInput
            label={t.content.detail}
            value={block.stat.detail ?? ''}
            onFocus={onInspectorFocus}
            onChange={onStatDetailChange}
            onBlur={onInspectorBlur}
          />

          <TextInput
            label={t.content.icon}
            value={block.stat.icon ?? ''}
            onFocus={onInspectorFocus}
            onChange={onStatIconChange}
            onBlur={onInspectorBlur}
          />
        </>
      )}

      {}
      {block.type === 'chart' && (
        <>
          <ArrayInput
            label={t.content.values}
            value={(block.values ?? []).join(', ')}
            placeholder={t.placeholders.chartValues}
            onFocus={onInspectorFocus}
            onChange={(value) => onChartValuesChange(parseNumberArray(value))}
            onBlur={onInspectorBlur}
          />

          <ArrayInput
            label={t.content.xLabels}
            value={(block.labels ?? []).join(', ')}
            placeholder={t.placeholders.chartLabels}
            onFocus={onInspectorFocus}
            onChange={(value) => onChartLabelsChange(parseStringArray(value))}
            onBlur={onInspectorBlur}
          />

          <ArrayInput
            label={t.content.yLabels}
            value={(block.yLabels ?? []).join(', ')}
            placeholder={t.placeholders.chartValues}
            onFocus={onInspectorFocus}
            onChange={(value) => onChartYLabelsChange(parseStringArray(value))}
            onBlur={onInspectorBlur}
          />

          <TextInput
            label={t.content.xAxisTitle}
            value={block.xAxisLabel ?? ''}
            placeholder={t.placeholders.chartXAxisTitle}
            onFocus={onInspectorFocus}
            onChange={onChartXAxisLabelChange}
            onBlur={onInspectorBlur}
          />

          <TextInput
            label={t.content.yAxisTitle}
            value={block.yAxisLabel ?? ''}
            placeholder={t.placeholders.chartYAxisTitle}
            onFocus={onInspectorFocus}
            onChange={onChartYAxisLabelChange}
            onBlur={onInspectorBlur}
          />
        </>
      )}

      {}
      {block.type === 'barChart' && (
        <>
          <ArrayInput
            label={t.content.values}
            value={(block.values ?? []).join(', ')}
            placeholder={t.placeholders.chartValues}
            onFocus={onInspectorFocus}
            onChange={(value) => onBarChartValuesChange(parseNumberArray(value))}
            onBlur={onInspectorBlur}
          />

          <ArrayInput
            label={t.content.labels}
            value={(block.labels ?? []).join(', ')}
            placeholder={t.placeholders.chartLabels}
            onFocus={onInspectorFocus}
            onChange={(value) => onBarChartLabelsChange(parseStringArray(value))}
            onBlur={onInspectorBlur}
          />
        </>
      )}

      {}
      {block.type === 'comparison' && block.comparison && (
        <>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#aaa',
              marginTop: 4,
            }}
          >
            {t.content.left}
          </div>

          <TextInput
            label={t.content.title}
            value={block.comparison.left.title}
            onFocus={onInspectorFocus}
            onChange={onComparisonLeftTitleChange}
            onBlur={onInspectorBlur}
          />

          <TextInput
            label={t.content.value}
            value={block.comparison.left.value}
            onFocus={onInspectorFocus}
            onChange={onComparisonLeftValueChange}
            onBlur={onInspectorBlur}
          />

          <TextInput
            label={t.content.arrow}
            value={block.comparison.arrow ?? '→'}
            onFocus={onInspectorFocus}
            onChange={onComparisonArrowChange}
            onBlur={onInspectorBlur}
          />

          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#aaa',
              marginTop: 4,
            }}
          >
            {t.content.right}
          </div>

          <TextInput
            label={t.content.title}
            value={block.comparison.right.title}
            onFocus={onInspectorFocus}
            onChange={onComparisonRightTitleChange}
            onBlur={onInspectorBlur}
          />

          <TextInput
            label={t.content.value}
            value={block.comparison.right.value}
            onFocus={onInspectorFocus}
            onChange={onComparisonRightValueChange}
            onBlur={onInspectorBlur}
          />
        </>
      )}

      {}
      {(block.type === 'bar' || block.type === 'progress') && (
        <>
          <NumberInput
            label={uiText(language, 'fromPercent')}
            value={block.fromValue ?? 0}
            min={0}
            max={100}
            onFocus={onInspectorFocus}
            onChange={onProgressValueChange}
            onBlur={onInspectorBlur}
          />

          <NumberInput
            label={uiText(language, 'toPercent')}
            value={
              block.toValue ??
              Math.min(100, Math.max(0, ((block.value ?? 0) / Math.max(1, block.max ?? 100)) * 100))
            }
            min={0}
            max={100}
            onFocus={onInspectorFocus}
            onChange={onProgressMaxChange}
            onBlur={onInspectorBlur}
          />

          <NumberInput
            label={t.content.fillDuration}
            value={
              block.fillDuration ?? ((block.duration ?? 0) > 0 ? (block.duration ?? 0) / 30 : 0)
            }
            min={0}
            // Allow any non-negative fill duration, independently of scene/block length.
            step={0.1}
            onFocus={onInspectorFocus}
            onChange={onProgressFillDurationChange}
            onBlur={onInspectorBlur}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <NumberInput
              label="Width"
              value={block.width ?? (block.type === 'progress' ? 700 : 500)}
              min={1}
              max={4000}
              onFocus={onInspectorFocus}
              onChange={onProgressWidthChange}
              onBlur={onInspectorBlur}
            />
            <NumberInput
              label="Height"
              value={block.height ?? (block.type === 'progress' ? 35 : 60)}
              min={1}
              max={4000}
              onFocus={onInspectorFocus}
              onChange={onProgressHeightChange}
              onBlur={onInspectorBlur}
            />
          </div>

          <NumberInput
            label="Radius"
            value={block.borderRadius ?? 0}
            min={0}
            max={Math.max(block.width ?? 0, block.height ?? 0) / 2}
            onFocus={onInspectorFocus}
            onChange={onProgressBorderRadiusChange}
            onBlur={onInspectorBlur}
          />
        </>
      )}

      {}
      {block.type === 'badge' && (
        <TextInput
          label={t.content.text}
          value={block.text ?? ''}
          onFocus={onInspectorFocus}
          onChange={onBadgeTextChange}
          onBlur={onInspectorBlur}
        />
      )}

      {}
      {block.type === 'image' && (
        <ImageUploadField
          value={block.image ?? ''}
          label={t.content.image}
          uploadLabel={t.common.upload}
          replaceLabel={t.common.replace}
          removeLabel={t.common.remove}
          onChange={onImageChange}
          onFocus={onInspectorFocus}
          onBlur={onInspectorBlur}
        />
      )}
    </>
  );
};

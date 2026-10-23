import React from 'react';

import {
  normalizeAnimation,
  getAnimationPreset,
  type AnimationType,
  type AnimationPreset,
} from '../../../domain/animation/animation';

import { NumberInput, SelectInput } from './InspectorInputs';

import { useI18n } from '../../i18n/I18nContext';

type AnimationInspectorProps = {
  animation: Parameters<typeof normalizeAnimation>[0] | undefined;

  onAnimationPresetChange: (value: AnimationPreset) => void;

  onAnimationEnterChange: (value: AnimationType) => void;

  onAnimationExitChange: (value: AnimationType) => void;

  onAnimationDurationChange: (value: number) => void;

  onAnimationExitDurationChange: (value: number) => void;

  onAnimationDelayChange: (value: number) => void;

  onAnimationExitDelayChange: (value: number) => void;

  onAnimationIntensityChange: (value: number) => void;

  onFocus: () => void;
  onBlur: () => void;
  fps: number;
};

export const AnimationInspector: React.FC<AnimationInspectorProps> = ({
  animation,

  onAnimationPresetChange,
  onAnimationEnterChange,
  onAnimationExitChange,
  onAnimationDurationChange,
  onAnimationExitDurationChange,
  onAnimationDelayChange,
  onAnimationExitDelayChange,
  onAnimationIntensityChange,

  onFocus,
  onBlur,
  fps,
}) => {
  const { translations: t } = useI18n();

  const normalized = normalizeAnimation(animation);

  const formatTiming = (frames: number) => {
    const safeFps = Number.isFinite(fps) && fps > 0 ? fps : 30;
    const seconds = frames / safeFps;
    return `${Math.round(frames)} frames · ${seconds.toFixed(2)}s`;
  };

  const preset = getAnimationPreset(animation);

  const intensityTypes: AnimationType[] = [
    'pop',
    'slideUp',
    'slideDown',
    'slideLeft',
    'slideRight',
    'bounce',
    'rotate',
  ];

  const intensityEnabled =
    intensityTypes.includes(normalized.enter) || intensityTypes.includes(normalized.exit);

  const animationOptions: {
    value: AnimationType;
    label: string;
  }[] = [
    {
      value: 'none',
      label: t.animation.none,
    },
    {
      value: 'fade',
      label: t.animation.fade,
    },
    {
      value: 'pop',
      label: t.animation.pop,
    },
    {
      value: 'slideUp',
      label: t.animation.slideUp,
    },
    {
      value: 'slideDown',
      label: t.animation.slideDown,
    },
    {
      value: 'slideLeft',
      label: t.animation.slideLeft,
    },
    {
      value: 'slideRight',
      label: t.animation.slideRight,
    },
    {
      value: 'bounce',
      label: t.animation.bounce,
    },
    {
      value: 'rotate',
      label: t.animation.rotate,
    },
  ];

  const animationPresetOptions: {
    value: AnimationPreset;
    label: string;
  }[] = [
    {
      value: 'none',
      label: t.animation.none,
    },
    {
      value: 'minimal',
      label: t.animation.presetMinimal,
    },
    {
      value: 'smooth',
      label: t.animation.presetSmooth,
    },
    {
      value: 'pop',
      label: t.animation.presetPop,
    },
    {
      value: 'slide',
      label: t.animation.presetSlide,
    },
    {
      value: 'dramatic',
      label: t.animation.presetDramatic,
    },
    {
      value: 'attention',
      label: t.animation.presetAttention,
    },
  ];

  return (
    <div
      style={{
        marginTop: 8,
        paddingTop: 16,
        borderTop: '1px solid #333',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <SelectInput
          label={t.animation.preset}
          value={preset}
          options={[
            {
              value: 'custom',
              label: t.animation.custom,
            },
            ...animationPresetOptions,
          ]}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(value) => {
            if (value !== 'custom') {
              onAnimationPresetChange(value as AnimationPreset);
            }
          }}
        />

        <SelectInput
          label={t.animation.enter}
          value={normalized.enter}
          options={animationOptions}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(value) => {
            onAnimationEnterChange(value as AnimationType);
          }}
        />

        <SelectInput
          label={t.animation.exit}
          value={normalized.exit}
          options={animationOptions}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(value) => {
            onAnimationExitChange(value as AnimationType);
          }}
        />

        <NumberInput
          label={t.animation.enterDuration}
          value={normalized.duration}
          step={1}
          min={1}
          unitText={formatTiming(normalized.duration)}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onAnimationDurationChange}
        />

        <NumberInput
          label={t.animation.exitDuration}
          value={normalized.exitDuration}
          step={1}
          min={1}
          unitText={formatTiming(normalized.exitDuration)}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onAnimationExitDurationChange}
        />

        <NumberInput
          label={t.animation.delay}
          value={normalized.delay}
          step={1}
          min={0}
          unitText={formatTiming(normalized.delay)}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onAnimationDelayChange}
        />

        <NumberInput
          label={t.animation.exitDelay}
          value={normalized.exitDelay}
          step={1}
          min={0}
          unitText={formatTiming(normalized.exitDelay)}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onAnimationExitDelayChange}
        />

        {intensityEnabled ? (
          <NumberInput
            label={t.animation.intensity}
            value={normalized.intensity}
            step={0.05}
            min={0}
            max={2}
            unitText="×"
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={onAnimationIntensityChange}
          />
        ) : null}
      </div>
    </div>
  );
};

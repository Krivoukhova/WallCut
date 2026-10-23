import React from 'react';

import type { ResolvedEditorBlock } from '../../editorTypes';

import { NumberInput } from './InspectorInputs';

import { useI18n } from '../../i18n/I18nContext';

type InspectorTimingSectionProps = {
  block: ResolvedEditorBlock['block'];

  onStartFrameChange: (value: number) => void;

  onDurationChange: (value: number) => void;
};

export const InspectorTimingSection: React.FC<InspectorTimingSectionProps> = ({
  block,
  onStartFrameChange,
  onDurationChange,
}) => {
  const { translations: t } = useI18n();

  return (
    <>
      <NumberInput
        label={t.inspector.startFrame}
        value={block.startFrame ?? 0}
        onChange={onStartFrameChange}
        min={0}
        step={1}
      />

      <NumberInput
        label={t.inspector.duration}
        value={block.duration ?? 30}
        onChange={onDurationChange}
        min={1}
        step={1}
      />

      <div
        style={{
          fontSize: 10,
          color: '#666',
          lineHeight: 1.4,
        }}
      >
        {t.inspector.frameInfo}
      </div>
    </>
  );
};

import React from 'react';

import { OverlayBlock } from '../OverlayBlock';
import { ComparisonBlock } from '../ComparisonBlock';
import { StatBlock } from '../StatBlock';
import { MetricBlock } from '../MetricBlock';

import { GroupBlock } from '../GroupBlock';
import { StackBlock } from '../StackBlock';
import { SequenceBlock } from '../SequenceBlock';

import { AnimatedText } from '../AnimatedText';
import { AnimatedNumber } from '../AnimatedNumber';
import { Money } from '../Money';
import { Chart } from '../Chart';

import { BarChart } from './ChartBlock';
import { ShapeBlock } from './ShapeBlock';
import { SimpleBlock } from './SimpleBlock';

import type { VisualBlockData } from '../VisualBlock.types';

type BlockRendererProps = {
  block: VisualBlockData;
};

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  switch (block.type) {
    case 'text':
      return (
        <AnimatedText
          fontSize={block.fontSize}
          fontWeight={block.fontWeight}
          fontFamily={block.fontFamily}
          color={block.color ?? block.textColor ?? '#ffffff'}
          startFrame={0}
          animate={false}
          width={block.width}
          height={block.height}
        >
          {block.text}
        </AnimatedText>
      );

    case 'number':
      return (
        <AnimatedNumber
          from={block.from ?? 0}
          to={block.to ?? 0}
          suffix={block.suffix}
          fontSize={block.fontSize}
          fontWeight={block.fontWeight}
          fontFamily={block.fontFamily}
          color={block.color ?? block.textColor ?? '#ffffff'}
          startFrame={block.startFrame ?? 0}
          duration={block.duration}
        />
      );

    case 'money':
      return (
        <Money
          amount={block.amount ?? 0}
          suffix={block.suffix}
          fontSize={block.fontSize}
          fontWeight={block.fontWeight}
          fontFamily={block.fontFamily}
          color={block.color ?? block.textColor ?? '#ffffff'}
          startFrame={0}
          animate={false}
        />
      );

    case 'stat':
      return <StatBlock block={block} animate={false} />;

    case 'metric':
      return <MetricBlock block={block} animate={false} />;

    case 'overlay':
      return <OverlayBlock block={block} />;

    case 'comparison':
      return <ComparisonBlock block={block} animate={false} />;

    case 'chart':
      return (
        <Chart
          values={block.values ?? []}
          labels={block.labels}
          yLabels={block.yLabels}
          xAxisLabel={block.xAxisLabel}
          yAxisLabel={block.yAxisLabel}
          width={block.width}
          height={block.height}
          startFrame={0}
          duration={block.duration}
          animate={false}
          color={block.color ?? block.textColor}
          fontSize={block.fontSize}
          fontWeight={block.fontWeight}
          fontFamily={block.fontFamily}
        />
      );

    case 'barChart':
      return (
        <BarChart
          values={block.values ?? []}
          labels={block.labels}
          yLabels={block.yLabels}
          xAxisLabel={block.xAxisLabel}
          yAxisLabel={block.yAxisLabel}
          width={block.width}
          height={block.height}
          color={block.color}
          backgroundColor={block.backgroundColor}
          borderRadius={block.borderRadius}
          startFrame={0}
          duration={block.duration}
          animate={false}
          fontSize={block.fontSize}
          fontWeight={block.fontWeight}
          fontFamily={block.fontFamily}
        />
      );

    case 'rectangle':
    case 'circle':
    case 'line':
    case 'arrow':
      return <ShapeBlock block={block} />;

    case 'bar':
    case 'progress':
    case 'badge':
    case 'image':
      return <SimpleBlock block={block} />;

    case 'group':
      return <GroupBlock block={block} />;

    case 'stack':
      return <StackBlock block={block} />;

    case 'sequence':
      return <SequenceBlock block={block} />;

    default:
      return null;
  }
};

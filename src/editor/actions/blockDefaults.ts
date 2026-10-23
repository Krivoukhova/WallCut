import type { LanguageCode, TranslationKeys } from '../../domain/i18n/types';
import type { VisualBlockData } from '../../domain/blocks/blockTypes';

/** Creates a block with the same defaults used by the editor's Add action. */
export function createDefaultEditorBlock(options: {
  type: VisualBlockData['type'];
  baseBlock: VisualBlockData;
  language: LanguageCode;
  translations: TranslationKeys;
}): VisualBlockData {
  const { type, baseBlock, language, translations } = options;
  let block: VisualBlockData;

  switch (type) {
    case 'text':
      block = {
        ...baseBlock,
        layer: 'text',
        text: translations.blocks.text.example,
        fontSize: 72,
        fontWeight: 600,
        color: '#ffffff',
      };
      break;

    case 'number':
      block = {
        ...baseBlock,
        layer: 'text',
        from: 100,
        to: 150,
        fontSize: 96,
        fontWeight: 700,
        color: '#ffffff',
      };
      break;

    case 'money':
      block = {
        ...baseBlock,
        layer: 'text',
        amount: 100000,
        suffix:
          language === 'en'
            ? '$'
            : language === 'es'
              ? '€'
              : language === 'zh'
                ? '¥'
                : language === 'hi'
                  ? '₹'
                  : '₽',
        fontSize: 88,
        fontWeight: 700,
        color: '#ffffff',
      };
      break;

    case 'metric':
      block = {
        ...baseBlock,
        layer: 'text',
        metric: {
          value: '+24%',
          label: translations.blocks.metric.income,
          icon: translations.common.arrowUp,
          direction: 'up',
        },
      };
      break;

    case 'stat':
      block = {
        ...baseBlock,
        layer: 'text',
        stat: {
          value: '+24%',
          label: translations.blocks.stat.incomeGrowth,
          detail: translations.blocks.stat.perMonth,
          icon: translations.common.arrowUp,
          direction: 'up',
        },
      };
      break;

    case 'chart':
      block = {
        ...baseBlock,
        layer: 'other',

        values: [100, 115, 108, 130, 145, 170],

        labels: translations.chart.months,

        yLabels: ['100', '120', '140', '160', '180'],

        xAxisLabel: translations.placeholders.chartXAxisTitle,
        yAxisLabel: translations.placeholders.chartYAxisTitle,

        width: 800,
        height: 400,

        color: '#4da3ff',
      };
      break;

    case 'barChart':
      block = {
        ...baseBlock,
        layer: 'other',

        values: [40, 65, 85, 55, 75],

        labels: translations.chart.months.slice(0, 5),

        width: 800,
        height: 400,

        color: '#4da3ff',
      };
      break;

    case 'comparison':
      block = {
        ...baseBlock,
        layer: 'other',

        comparison: {
          left: {
            title: translations.blocks.comparison.before,
            value: '100 000 ₽',
          },

          right: {
            title: translations.blocks.comparison.after,
            value: '69 000 ₽',
          },

          arrow: translations.common.arrowRight,
        },
      };
      break;

    case 'group':
      block = {
        ...baseBlock,
        width: 600,
        height: 300,
        children: [],
      };
      break;

    case 'stack':
      block = {
        ...baseBlock,
        width: 600,
        height: 400,
        children: [],
        direction: 'vertical',
        gap: 24,
        align: 'center',
        justify: 'center',
      };
      break;

    case 'sequence':
      block = {
        ...baseBlock,
        children: [],
        direction: 'horizontal',
        gap: 24,
      };
      break;

    case 'rectangle':
      block = {
        ...baseBlock,
        layer: 'shape',
        width: 400,
        height: 200,
        backgroundColor: '#ffffff',
        borderRadius: 24,
      };
      break;

    case 'circle':
      block = {
        ...baseBlock,
        layer: 'shape',
        width: 200,
        height: 200,
        backgroundColor: '#ffffff',
      };
      break;

    case 'line':
      block = {
        ...baseBlock,
        layer: 'shape',
        width: 400,
        height: 4,
        backgroundColor: '#ffffff',
        strokeWidth: 4,
      };
      break;

    case 'arrow':
      block = {
        ...baseBlock,
        layer: 'shape',
        width: 400,
        height: 80,
        color: '#ffffff',
        strokeWidth: 6,
      };
      break;

    case 'bar':
      block = {
        ...baseBlock,
        layer: 'shape',
        width: 400,
        height: 60,
        backgroundColor: '#4da3ff',
        borderRadius: 12,
        value: 65,
        max: 100,
        fromValue: 0,
        toValue: 65,
        fillDuration: 2,
      };
      break;

    case 'progress':
      block = {
        ...baseBlock,
        layer: 'shape',
        value: 65,
        max: 100,
        fromValue: 0,
        toValue: 65,
        fillDuration: 2,
        width: 500,
        height: 40,
        backgroundColor: '#4da3ff',
        borderRadius: 20,
      };
      break;

    case 'badge':
      block = {
        ...baseBlock,
        layer: 'shape',
        text: translations.blocks.badge.important,
        // Match the badge styling used by the built-in examples.
        backgroundColor: '#333333',
        color: '#ffffff',
        fontSize: 42,
        fontWeight: 800,
        padding: '18px 35px',
        borderRadius: 999,
      };
      break;

    case 'image':
      block = {
        ...baseBlock,
        layer: 'other',
        image: '',
        fontSize: 72,
        width: 300,
        height: 300,
        color: '#ffffff',
      };
      break;

    case 'overlay':
      block = {
        ...baseBlock,
        layer: 'other',
        width: 800,
        height: 400,
        backgroundColor: 'rgba(0,0,0,0.35)',
        borderRadius: 24,
      };
      break;

    default:
      block = baseBlock;
      break;
  }
  return block;
}

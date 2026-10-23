import React from 'react';

import type { VisualBlockData } from '../domain/blocks/blockTypes';

import { useI18n } from './i18n/I18nContext';

type LibraryItem = {
  type: VisualBlockData['type'];
  icon: string;
};

type EditorLibraryProps = {
  onAddBlock: (type: VisualBlockData['type']) => void;

  width?: number;

  onResizeStart?: (event: React.PointerEvent) => void;
};

const LIBRARY_ITEMS: LibraryItem[] = [
  {
    type: 'text',
    icon: 'T',
  },
  {
    type: 'number',
    icon: '#',
  },
  {
    type: 'money',
    icon: '₽',
  },
  {
    type: 'metric',
    icon: '%',
  },
  {
    type: 'stat',
    icon: '↗',
  },
  {
    type: 'chart',
    icon: '⌁',
  },
  {
    type: 'barChart',
    icon: '▥',
  },
  {
    type: 'comparison',
    icon: '⇄',
  },
  {
    type: 'group',
    icon: '▦',
  },
  {
    type: 'stack',
    icon: '▤',
  },
  {
    type: 'rectangle',
    icon: '□',
  },
  {
    type: 'circle',
    icon: '○',
  },
  {
    type: 'line',
    icon: '—',
  },
  {
    type: 'arrow',
    icon: '→',
  },
  {
    type: 'progress',
    icon: '▰',
  },
  {
    type: 'badge',
    icon: '◆',
  },
  {
    type: 'image',
    icon: '★',
  },
];

export const EditorLibrary: React.FC<EditorLibraryProps> = ({
  onAddBlock,
  width = 180,
  onResizeStart,
}) => {
  const { translations: t } = useI18n();

  const labels: Record<VisualBlockData['type'], string> = {
    overlay: t.library.overlay,
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
    bar: t.library.progress,
    progress: t.library.progress,
    badge: t.library.badge,
    image: t.library.image,
  };

  return (
    <div
      className="fs-editor-library"
      style={{
        width,
        flex: '0 0 auto',

        minWidth: 0,
        minHeight: 0,

        height: '100%',

        borderRight: '1px solid #333',

        borderRadius: '0 8px 8px 0',

        background: '#202020',

        padding: 12,

        boxSizing: 'border-box',

        overflowY: 'auto',
        overflowX: 'hidden',

        overscrollBehavior: 'contain',

        position: 'relative',
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        {t.library.title}
      </div>

      <div
        style={{
          display: 'grid',

          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',

          gap: 6,

          width: '100%',
          minWidth: 0,
        }}
      >
        {LIBRARY_ITEMS.map((item) => (
          <button
            className="fs-library-item"
            key={item.type}
            type="button"
            onClick={() => onAddBlock(item.type)}
            style={{
              minWidth: 0,
              width: '100%',

              minHeight: 58,

              padding: 6,

              border: '1px solid #3a3a3a',

              borderRadius: '0 8px 8px 0',

              background: '#181818',

              color: '#fff',

              cursor: 'pointer',

              display: 'flex',
              flexDirection: 'column',

              alignItems: 'center',

              justifyContent: 'center',

              gap: 5,

              boxSizing: 'border-box',

              overflow: 'hidden',
            }}
          >
            <span
              style={{
                fontSize: 18,
                lineHeight: 1,
                color: '#4da3ff',

                flexShrink: 0,
              }}
            >
              {item.icon}
            </span>

            <span
              style={{
                fontSize: 10,
                color: '#ccc',

                width: '100%',

                minWidth: 0,

                textAlign: 'center',

                overflow: 'hidden',

                textOverflow: 'ellipsis',

                whiteSpace: 'nowrap',
              }}
            >
              {labels[item.type]}
            </span>
          </button>
        ))}
      </div>
      {onResizeStart && (
        <div
          onPointerDown={onResizeStart}
          style={{
            position: 'absolute',

            top: 0,
            right: 0,
            bottom: 0,

            width: 8,

            cursor: 'col-resize',

            zIndex: 100,

            touchAction: 'none',
          }}
        />
      )}
    </div>
  );
};

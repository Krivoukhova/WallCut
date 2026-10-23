import React from 'react';

import { VisualBlock } from './VisualBlock';
import type { VisualBlockData } from './VisualBlock.types';
import { getBlockMetrics } from '../domain/layout/metrics';

type GroupBlockProps = {
  block: VisualBlockData;
};

type GroupLayout = {
  direction?: 'row' | 'column';
};

export const GroupBlock: React.FC<GroupBlockProps> = ({ block }) => {
  const layout = block.layout;
  const groupWidth = block.width ?? 600;
  const groupHeight = block.height ?? 300;
  // Group resizing changes the container itself, not the visual size of its children.
  // Children are rendered in an inverse-scaled local layer so their own dimensions stay unchanged.
  const groupScaleX = Math.max(0.0001, (block.scale ?? 1) * (block.scaleX ?? 1));
  const groupScaleY = Math.max(0.0001, (block.scale ?? 1) * (block.scaleY ?? 1));
  const children = (block.children ?? []).filter((child, index, array) => {
    const id = child.id ?? `${child.type}-${index}`;
    return (
      array.findIndex(
        (candidate, candidateIndex) =>
          (candidate.id ?? `${candidate.type}-${candidateIndex}`) === id,
      ) === index
    );
  });

  if (!layout || layout === ('none' as never)) {
    return (
      <div
        style={{
          position: 'relative',

          width: groupWidth,

          height: groupHeight,

          padding: block.padding ?? 0,

          boxSizing: 'border-box',

          backgroundColor: block.backgroundColor ?? 'transparent',

          borderRadius: block.borderRadius ?? 0,

          border: block.borderWidth
            ? `${block.borderWidth}px solid ${block.borderColor ?? 'white'}`
            : 'none',

          overflow: 'visible',
        }}
      >
        {children.map((child: VisualBlockData, index: number) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              // Give each child a stable local layout box. Without explicit
              // dimensions, absolutely-positioned text uses shrink-to-fit
              // sizing and wraps after grouping even when its original box
              // had enough width.
              width:
                child.type === 'circle'
                  ? (child.width ?? child.height ?? 100)
                  : child.type === 'text'
                    ? (child.width ?? getBlockMetrics(child).width)
                    : (child.width ?? getBlockMetrics(child).width),
              height:
                child.type === 'circle'
                  ? (child.width ?? child.height ?? 100)
                  : child.type === 'text'
                    ? (child.height ?? getBlockMetrics(child).height)
                    : (child.height ?? getBlockMetrics(child).height),
              boxSizing: 'border-box',
              borderRadius: child.type === 'circle' ? 9999 : undefined,
              minWidth: 0,
              flex: 'none',
              left: groupWidth / 2 + (child.x ?? 0) / groupScaleX,

              top: groupHeight / 2 + (child.y ?? 0) / groupScaleY,

              transform: `translate(-50%, -50%) scale(${1 / groupScaleX}, ${1 / groupScaleY})`,
              transformOrigin: 'center center',

              display: 'flex',

              alignItems: 'center',
              justifyContent: 'center',

              whiteSpace: child.type === 'text' ? 'pre-wrap' : 'nowrap',
            }}
          >
            <VisualBlock
              block={{
                ...child,
                ...(child.type === 'circle'
                  ? {
                      width: child.width ?? child.height ?? 100,
                      height: child.width ?? child.height ?? 100,
                      borderRadius: 9999,
                    }
                  : {}),
                x: 0,
                y: 0,
              }}
              insideContainer
            />
          </div>
        ))}
      </div>
    );
  }

  const layoutObject = layout as GroupLayout;

  const direction = layoutObject.direction ?? 'row';

  return (
    <div
      style={{
        display: 'flex',

        flexDirection: direction,

        alignItems:
          block.align === 'start' ? 'flex-start' : block.align === 'end' ? 'flex-end' : 'center',

        justifyContent:
          block.justify === 'start'
            ? 'flex-start'
            : block.justify === 'end'
              ? 'flex-end'
              : 'center',

        gap: block.gap ?? 0,

        width: block.width ?? 'max-content',

        height: block.height ?? 'max-content',

        padding: block.padding ?? 0,

        boxSizing: 'border-box',

        backgroundColor: block.backgroundColor ?? 'transparent',

        borderRadius: block.borderRadius ?? 0,

        border: block.borderWidth
          ? `${block.borderWidth}px solid ${block.borderColor ?? 'white'}`
          : 'none',

        overflow: 'visible',
      }}
    >
      {children.map((child: VisualBlockData, index: number) => (
        <div
          key={index}
          style={{
            transform: `scale(${1 / groupScaleX}, ${1 / groupScaleY})`,
            transformOrigin: 'center center',
            display: 'contents',
          }}
        >
          <VisualBlock
            block={{
              ...child,
              ...(child.type === 'circle'
                ? {
                    width: child.width ?? child.height ?? 100,
                    height: child.width ?? child.height ?? 100,
                    // A circle must keep its shape after being placed in a Group.
                    // The container renderer uses the child's borderRadius directly.
                    borderRadius: child.borderRadius ?? 9999,
                  }
                : {}),
            }}
            insideContainer
          />
        </div>
      ))}
    </div>
  );
};

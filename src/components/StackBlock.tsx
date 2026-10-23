import React from 'react';
import { useCurrentFrame } from 'remotion';

import { VisualBlock } from './VisualBlock';
import type { VisualBlockData } from './VisualBlock.types';

import { normalizeAnimation } from '../domain/animation/animation';

type StackBlockProps = {
  block: VisualBlockData;
};

const getAlignItems = (align?: VisualBlockData['align']) => {
  switch (align) {
    case 'start':
      return 'flex-start';

    case 'end':
      return 'flex-end';

    default:
      return 'center';
  }
};

const getJustifyContent = (justify?: VisualBlockData['justify']) => {
  switch (justify) {
    case 'start':
      return 'flex-start';

    case 'end':
      return 'flex-end';

    default:
      return 'center';
  }
};

export const StackBlock: React.FC<StackBlockProps> = ({ block }) => {
  const frame = useCurrentFrame();
  const direction = block.direction === 'horizontal' ? 'row' : 'column';

  const stagger = block.stagger ?? 0;

  const children = block.children ?? [];

  // Stack owns the available space. Rows divide that space instead of
  // allowing child content to determine the Stack size. This keeps every
  // child visible even after adding many items.
  const stackWidth = block.width ?? 600;
  const padding =
    typeof block.padding === 'number' ? block.padding : Number(block.padding ?? 0) || 0;
  const gap = block.gap ?? 0;

  const getChildHeight = (child: VisualBlockData) => {
    switch (child.type) {
      case 'image':
        return 160;
      case 'number':
        return 88;
      case 'money':
        return 80;
      case 'text':
      default:
        return 64;
    }
  };

  const minimumContentHeight =
    children.reduce((total, child) => total + getChildHeight(child), 0) +
    gap * Math.max(0, children.length - 1);

  // Keep the explicit block height when it is large enough, but never let
  // the rendered Stack become shorter than its children require. The editor
  // also persists this larger height when a new child is added.
  const stackHeight = Math.max(block.height ?? 400, padding * 2 + minimumContentHeight);

  return (
    <div
      style={{
        position: 'relative',

        display: 'flex',

        flexDirection: direction,

        alignItems: getAlignItems(block.align),

        justifyContent: getJustifyContent(block.justify),

        gap,

        width: stackWidth,

        height: stackHeight,

        padding,

        boxSizing: 'border-box',

        backgroundColor: block.backgroundColor ?? 'transparent',

        borderRadius: block.borderRadius ?? 0,

        border: block.borderWidth
          ? `${block.borderWidth}px solid ${block.borderColor ?? 'white'}`
          : 'none',

        opacity: block.opacity ?? 1,

        overflow: 'hidden',
      }}
    >
      {children.map((child: VisualBlockData, index: number) => {
        const existingAnimation = normalizeAnimation(child.animation);

        const existingDelay = existingAnimation.delay ?? 0;

        const calculatedDelay = existingDelay + index * stagger;

        const childWithAnimation =
          stagger > 0
            ? {
                ...child,

                animation: {
                  ...existingAnimation,

                  delay: calculatedDelay,
                },
              }
            : child;

        // Preserve the child's own backgroundColor. New text rows are
        // created transparent by default, while a user-selected background
        // color must remain visible inside Stack.
        const renderChild = childWithAnimation;

        const childId = child.id ?? `${child.type}-${index}`;

        return (
          <div
            key={childId}
            style={{
              flex: `0 0 ${getChildHeight(childWithAnimation)}px`,
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'stretch',
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              height: getChildHeight(childWithAnimation),
              minHeight: getChildHeight(childWithAnimation),
              maxHeight: getChildHeight(childWithAnimation),
              boxSizing: 'border-box',
              overflow: 'hidden',
              position: 'relative',
              contain: 'layout paint',
              // Keep the row in the Stack layout before its start frame; only its
              // contents become visible. This avoids shifting sibling elements.
              visibility: frame < (childWithAnimation.startFrame ?? 0) ? 'hidden' : 'visible',
            }}
          >
            <VisualBlock block={renderChild} insideContainer />
          </div>
        );
      })}
    </div>
  );
};

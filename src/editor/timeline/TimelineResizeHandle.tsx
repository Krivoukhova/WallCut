import React from 'react';

type TimelineResizeHandleProps = {
  onResizeStart: (event: React.PointerEvent<HTMLDivElement>) => void;

  onResizeMove: (event: React.PointerEvent<HTMLDivElement>) => void;

  onResizeEnd: (event: React.PointerEvent<HTMLDivElement>) => void;
};

export const TimelineResizeHandle: React.FC<TimelineResizeHandleProps> = ({
  onResizeStart,
  onResizeMove,
  onResizeEnd,
}) => {
  return (
    <div
      data-timeline-resize="true"
      onPointerDown={onResizeStart}
      onPointerMove={onResizeMove}
      onPointerUp={onResizeEnd}
      onPointerCancel={onResizeEnd}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: -1,
        height: 8,
        cursor: 'ns-resize',
        zIndex: 1000,
        touchAction: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 42,
          height: 3,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.22)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

import React, { useState } from 'react';

type InspectorSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export const InspectorSection: React.FC<InspectorSectionProps> = ({
  title,
  children,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  const handleToggle = () => {
    setOpen((current) => !current);
  };

  return (
    <div
      style={{
        border: '1px solid #333',
        borderRadius: 6,
        background: '#242424',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        style={{
          width: '100%',
          minHeight: 38,

          display: 'flex',
          alignItems: 'center',

          padding: '0 10px',

          border: 'none',
          borderBottom: open ? '1px solid #333' : 'none',

          background: '#282828',
          color: '#ddd',

          cursor: 'pointer',

          fontFamily: 'inherit',
          fontSize: 12,
          fontWeight: 600,

          textAlign: 'left',
        }}
      >
        <span
          style={{
            width: 16,
            color: '#888',
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          {open ? '▼' : '▶'}
        </span>

        <span>{title}</span>
      </button>

      {open && (
        <div
          style={{
            padding: 10,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

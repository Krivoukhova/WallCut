import React, { useState } from 'react';

type HotkeyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  hotkey: string;
};

export const HotkeyButton: React.FC<HotkeyButtonProps> = ({
  hotkey,
  style,
  title,
  disabled,
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      disabled={disabled}
      title={title ?? hotkey}
      onMouseEnter={(event) => {
        setHovered(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setHovered(false);
        onMouseLeave?.(event);
      }}
      style={{
        ...style,
        ...(hovered && !disabled
          ? {
              background: '#353535',
              borderColor: '#6b6b6b',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 0 10px rgba(255,255,255,0.06)',
            }
          : {}),
      }}
    >
      <span>{children}</span>
    </button>
  );
};

import React, { useCallback, useEffect, useRef, useState } from 'react';

export type NumberInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  step?: number;
  min?: number;
  max?: number;
  unitText?: string;
};

export type TextInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
};

export type SelectInputProps = {
  label: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export type ArrayInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
};

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  step = 1,
  min,
  max,
  unitText,
}) => {
  const clamp = (next: number) => {
    if (!Number.isFinite(next)) return min ?? 0;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    return next;
  };

  const formatValue = useCallback(
    (next: number) => (Number.isFinite(next) ? String(Number(next.toFixed(3))) : String(min ?? 0)),
    [min],
  );

  const [draftValue, setDraftValue] = useState(() => formatValue(value));
  const isEditing = useRef(false);
  const draftValueRef = useRef(draftValue);
  draftValueRef.current = draftValue;

  useEffect(() => {
    if (!isEditing.current) {
      draftValueRef.current = formatValue(value);
      setDraftValue(formatValue(value));
    }
  }, [formatValue, value]);

  const commitDraft = () => {
    const normalized = draftValueRef.current.trim().replace(',', '.');
    const parsed = Number(normalized);
    const next = normalized === '' || !Number.isFinite(parsed) ? clamp(0) : clamp(parsed);

    const formatted = formatValue(next);
    draftValueRef.current = formatted;
    setDraftValue(formatted);
    onChange(next);
  };

  const getCurrentDraftNumber = () => {
    const normalized = draftValueRef.current.trim().replace(',', '.');
    const parsed = Number(normalized);
    return normalized !== '' && Number.isFinite(parsed)
      ? parsed
      : Number.isFinite(value)
        ? value
        : 0;
  };

  const changeBy = (direction: 1 | -1) => {
    const next = clamp(getCurrentDraftNumber() + step * direction);
    const formatted = formatValue(next);
    draftValueRef.current = formatted;
    setDraftValue(formatted);
    onChange(next);
  };

  const startRepeat = (event: React.PointerEvent<HTMLButtonElement>, direction: 1 | -1) => {
    event.preventDefault();
    event.stopPropagation();

    const target = event.currentTarget;
    let currentValue = getCurrentDraftNumber();
    const stepOnce = () => {
      currentValue = clamp(currentValue + step * direction);
      const formatted = formatValue(currentValue);
      draftValueRef.current = formatted;
      setDraftValue(formatted);
      onChange(currentValue);
    };
    stepOnce();

    const timeout = window.setTimeout(() => {
      const interval = window.setInterval(stepOnce, 70);
      target.dataset.numberRepeatInterval = String(interval);
    }, 350);

    target.dataset.numberRepeatTimeout = String(timeout);
    target.setPointerCapture?.(event.pointerId);
  };

  const stopRepeat = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const target = event.currentTarget;
    const timeout = Number(target.dataset.numberRepeatTimeout);
    const interval = Number(target.dataset.numberRepeatInterval);
    if (timeout) window.clearTimeout(timeout);
    if (interval) window.clearInterval(interval);
    delete target.dataset.numberRepeatTimeout;
    delete target.dataset.numberRepeatInterval;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: '#999',
        }}
      >
        <span>{label}</span>
        {unitText ? (
          <span style={{ marginLeft: 6, color: '#6f7782', fontSize: 10 }}>{unitText}</span>
        ) : null}
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 32,
        }}
      >
        <input
          type="text"
          inputMode="decimal"
          value={draftValue}
          onFocus={() => {
            isEditing.current = true;
            onFocus?.();
          }}
          onChange={(event) => {
            const rawValue = event.target.value;
            draftValueRef.current = rawValue;
            setDraftValue(rawValue);

            const normalized = rawValue.trim().replace(',', '.');
            if (
              normalized === '' ||
              normalized === '-' ||
              normalized === '.' ||
              normalized === '-.'
            ) {
              return;
            }

            const nextValue = Number(normalized);
            if (Number.isFinite(nextValue)) {
              onChange(clamp(nextValue));
            }
          }}
          onBlur={() => {
            commitDraft();
            isEditing.current = false;
            onBlur?.();
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              changeBy(1);
            } else if (event.key === 'ArrowDown') {
              event.preventDefault();
              changeBy(-1);
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            padding: '0 24px 0 8px',
            border: '1px solid #444',
            borderRadius: 5,
            background: '#181818',
            color: '#fff',
            outline: 'none',
            fontVariantNumeric: 'tabular-nums',
          }}
        />

        <div
          style={{
            position: 'absolute',
            right: 1,
            top: 1,
            bottom: 1,
            width: 18,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderLeft: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '0 4px 4px 0',
            background: '#191919',
          }}
        >
          <button
            type="button"
            aria-label={`${label} +`}
            onPointerDown={(event) => startRepeat(event, 1)}
            onPointerUp={stopRepeat}
            onPointerCancel={stopRepeat}
            onPointerLeave={stopRepeat}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            style={{
              flex: 1,
              minHeight: 0,
              padding: 0,
              border: 0,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: 'transparent',
              color: '#aeb6c2',
              fontSize: 8,
              lineHeight: 1,
              cursor: 'pointer',
            }}
          >
            ▲
          </button>
          <button
            type="button"
            aria-label={`${label} −`}
            onPointerDown={(event) => startRepeat(event, -1)}
            onPointerUp={stopRepeat}
            onPointerCancel={stopRepeat}
            onPointerLeave={stopRepeat}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            style={{
              flex: 1,
              minHeight: 0,
              padding: 0,
              border: 0,
              background: 'transparent',
              color: '#aeb6c2',
              fontSize: 8,
              lineHeight: 1,
              cursor: 'pointer',
            }}
          >
            ▼
          </button>
        </div>
      </div>
    </div>
  );
};

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
}) => {
  // Keep the exact text being edited locally so parent updates cannot reset
  // intermediate input states while the user is typing.
  const [draft, setDraft] = useState(value);
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setDraft(value);
    }
  }, [value]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: '#999',
        }}
      >
        {label}
      </div>

      <input
        type="text"
        value={draft}
        placeholder={placeholder}
        onFocus={() => {
          isFocused.current = true;
          onFocus?.();
        }}
        onChange={(event) => {
          const nextValue = event.target.value;
          setDraft(nextValue);
          onChange(nextValue);
        }}
        onBlur={() => {
          isFocused.current = false;
          onBlur?.();
        }}
        style={{
          width: '100%',
          height: 32,
          boxSizing: 'border-box',
          padding: '0 8px',
          border: '1px solid #444',
          borderRadius: 5,
          background: '#181818',
          color: '#fff',
          outline: 'none',
          fontSize: 12,
        }}
      />
    </div>
  );
};

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  options,
  onChange,
  onFocus,
  onBlur,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: '#999',
        }}
      >
        {label}
      </div>

      <select
        value={value}
        onFocus={onFocus}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        onBlur={onBlur}
        style={{
          width: '100%',
          height: 32,
          boxSizing: 'border-box',
          padding: '0 8px',
          border: '1px solid #444',
          borderRadius: 5,
          background: '#181818',
          color: '#fff',
          outline: 'none',
          fontSize: 12,
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const ArrayInput: React.FC<ArrayInputProps> = ({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
}) => {
  // Keep the exact text being edited locally. The parent parses this field
  // into an array on every keystroke, so rendering `value` directly would
  // immediately remove temporary states such as "", "1," or "1, ".
  const [draft, setDraft] = useState(value);
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setDraft(value);
    }
  }, [value]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: '#999',
        }}
      >
        {label}
      </div>

      <input
        type="text"
        value={draft}
        placeholder={placeholder}
        onFocus={() => {
          isFocused.current = true;
          onFocus?.();
        }}
        onChange={(event) => {
          const nextValue = event.target.value;
          setDraft(nextValue);
          onChange(nextValue);
        }}
        onBlur={() => {
          isFocused.current = false;
          onBlur?.();
        }}
        style={{
          width: '100%',
          height: 32,
          boxSizing: 'border-box',
          padding: '0 8px',
          border: '1px solid #444',
          borderRadius: 5,
          background: '#181818',
          color: '#fff',
          outline: 'none',
          fontSize: 12,
        }}
      />
    </div>
  );
};

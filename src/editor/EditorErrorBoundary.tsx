import React from 'react';
import { I18nProvider, useI18n } from './i18n/I18nContext';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

const ErrorBoundaryContent: React.FC<{ error: Error }> = ({ error }) => {
  const { translations: t } = useI18n();
  return (
    <div
      style={{
        minHeight: '100vh',
        boxSizing: 'border-box',
        padding: 32,
        background: '#181818',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ marginTop: 0, fontSize: 20 }}>{t.errors.projectOpenFailed}</h1>
      <p style={{ color: '#fca5a5' }}>{t.errors.projectDataRenderFailed}</p>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          padding: 16,
          borderRadius: 8,
          background: '#111',
          color: '#e5e7eb',
        }}
      >
        {error.message || String(error)}
      </pre>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{ marginTop: 12, padding: '8px 12px', cursor: 'pointer' }}
      >
        {t.errors.reloadEditor}
      </button>
    </div>
  );
};

export class EditorErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('WallCut editor render failed:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <I18nProvider>
        <ErrorBoundaryContent error={this.state.error} />
      </I18nProvider>
    );
  }
}

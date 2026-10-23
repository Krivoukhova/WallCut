import { useEffect, useState } from 'react';

/** Owns persisted quick-access preferences and the editor blade-state event. */
export const useEditorWorkspacePreferences = () => {
  const [bladeActiveUi, setBladeActiveUi] = useState(false);
  const [quickAccessEnabled, setQuickAccessEnabled] = useState(() => {
    try {
      return (window.localStorage.getItem('wallcut-editor-quick-access') ??
        window.localStorage.getItem('finance-shorts-editor-quick-access')) !== 'false';
    } catch {
      return true;
    }
  });
  const [sceneQuickAccessEnabled, setSceneQuickAccessEnabled] = useState(() => {
    try {
      return window.localStorage.getItem('wallcut-scene-quick-access') !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const handleBladeState = (event: Event) =>
      setBladeActiveUi(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener('editor-blade-state', handleBladeState);
    return () => window.removeEventListener('editor-blade-state', handleBladeState);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('wallcut-scene-quick-access', String(sceneQuickAccessEnabled));
    } catch {
      // Keep the scene quick-access toggle functional for this session.
    }
    window.dispatchEvent(
      new CustomEvent('editor-scene-quick-access-change', { detail: sceneQuickAccessEnabled }),
    );
  }, [sceneQuickAccessEnabled]);

  useEffect(() => {
    try {
      window.localStorage.setItem('wallcut-editor-quick-access', String(quickAccessEnabled));
    } catch {
      // Storage may be unavailable; keep the in-session toggle working.
    }
    window.dispatchEvent(
      new CustomEvent('editor-quick-access-change', { detail: quickAccessEnabled }),
    );
  }, [quickAccessEnabled]);

  return {
    bladeActiveUi,
    quickAccessEnabled,
    setQuickAccessEnabled,
    sceneQuickAccessEnabled,
    setSceneQuickAccessEnabled,
  };
};

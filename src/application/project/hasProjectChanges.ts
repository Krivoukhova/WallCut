export type ProjectChangeState = {
  editorDirty: boolean;
  audioFingerprint: string;
  savedAudioFingerprint: string;
  audioAssetsDirty: boolean;
  projectName: string;
  savedProjectName: string;
  backgroundFingerprint: string;
  savedBackgroundFingerprint: string;
};

/** Determine whether any persisted part of the editor differs from its saved state. */
export function hasProjectChanges(state: ProjectChangeState): boolean {
  return (
    state.editorDirty ||
    state.audioFingerprint !== state.savedAudioFingerprint ||
    state.audioAssetsDirty ||
    state.projectName !== state.savedProjectName ||
    state.backgroundFingerprint !== state.savedBackgroundFingerprint
  );
}

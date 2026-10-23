/** A save may clear the dirty flag only if no newer audio edit occurred while it was pending. */
export function canClearAudioAssetDirtyFlag(currentRevision: number, savedRevision: number): boolean {
  return currentRevision === savedRevision;
}

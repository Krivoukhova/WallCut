import type { EditorAudioTrack } from '../../editor/timeline/audioTrackOperations';

export type AudioAssetPatch = Array<{
  id: string;
  binary: ArrayBuffer;
  state: EditorAudioTrack['state'];
  fileName: string | undefined;
  mimeType: string | undefined;
}>;

/** Include audio binaries only when an asset-level change needs persistence. */
export function buildAudioAssetPatch(
  audioTracks: EditorAudioTrack[],
  isDirty: boolean,
): AudioAssetPatch | undefined {
  if (!isDirty) return undefined;

  return audioTracks.map(({ id, binary, state, fileName, mimeType }) => ({
    id,
    binary,
    state,
    fileName,
    mimeType,
  }));
}

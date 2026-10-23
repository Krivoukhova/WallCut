import React from 'react';
import { AbsoluteFill, staticFile, Sequence } from 'remotion';
import { Audio } from '@remotion/media';

import { SpeechVisualTimeline } from '../components/SpeechVisualTimeline';

import type { RenderModel } from '../renderer/renderModel';

type PlayerCompositionProps = {
  renderModel: RenderModel;
  editorMode?: boolean;
  onStackChildTextChange?: (stackId: string, childId: string, text: string) => void;
};

export const PlayerComposition: React.FC<PlayerCompositionProps> = ({
  renderModel,
  editorMode = false,
  onStackChildTextChange,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#111',
      }}
    >
      {renderModel.audioTracks.map((track) =>
        track.publicPath ? (
          <Sequence
            key={track.id}
            from={track.state.startFrame}
            durationInFrames={track.state.durationFrames}
          >
            <Audio
              src={
                editorMode
                  ? /^(blob:|data:|https?:)/i.test(track.publicPath)
                    ? track.publicPath
                    : `/${track.publicPath.replace(/^\/+/, '')}`
                  : staticFile(track.publicPath)
              }
              trimBefore={track.state.sourceStartFrame}
              trimAfter={track.state.sourceEndFrame}
              volume={track.state.muted ? 0 : track.state.volume}
            />
          </Sequence>
        ) : null,
      )}

      <SpeechVisualTimeline
        renderModel={renderModel}
        editorMode={editorMode}
        onStackChildTextChange={onStackChildTextChange}
      />
    </AbsoluteFill>
  );
};

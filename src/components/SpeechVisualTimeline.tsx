import React from 'react';

import { Sequence } from 'remotion';

import { VisualBlock } from './VisualBlock';
import { BlockRenderer } from './blocks/BlockRenderer';
import { BlockRendererContext } from './blocks/BlockRendererContext';
import { SceneBackground } from './SceneBackground';

import type { RenderModel } from '../renderer/renderModel';

import { resolveBlocks } from '../domain/resolution/blockResolver';

type SpeechVisualTimelineProps = {
  renderModel: RenderModel;
  editorMode?: boolean;
  onStackChildTextChange?: (stackId: string, childId: string, text: string) => void;
};

export const SpeechVisualTimeline: React.FC<SpeechVisualTimelineProps> = ({
  renderModel,
  editorMode = false,
  onStackChildTextChange,
}) => {
  return (
    <BlockRendererContext.Provider value={BlockRenderer}>
      {renderModel.scenes.map((scene) => {
        const blocks = resolveBlocks(scene.blocks, scene.durationFrames);

        return (
          <Sequence key={scene.id} from={scene.startFrame} durationInFrames={scene.durationFrames}>
            <SceneBackground background={scene.background} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: scene.contentOpacity,
                pointerEvents: 'auto',
              }}
            >
              {blocks.map((resolved) => (
                <Sequence
                  key={resolved.id}
                  from={resolved.startFrame}
                  durationInFrames={resolved.duration}
                >
                  <VisualBlock
                    // The enclosing Sequence already offsets this block on the timeline.
                    // Pass a local start frame so entrance and exit animations use the
                    // block's own duration rather than subtracting the timeline offset twice.
                    block={{ ...resolved.block, startFrame: 0 }}
                    durationInFrames={resolved.duration}
                    editorMode={editorMode}
                    onStackChildTextChange={onStackChildTextChange}
                  />
                </Sequence>
              ))}
            </div>
          </Sequence>
        );
      })}
    </BlockRendererContext.Provider>
  );
};

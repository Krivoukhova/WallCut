import { createContext } from 'react';
import type { ComponentType } from 'react';

import type { VisualBlockData } from '../VisualBlock.types';

export type BlockRendererComponent = ComponentType<{ block: VisualBlockData }>;

/** Injects the block renderer into VisualBlock without a reverse module import. */
export const BlockRendererContext = createContext<BlockRendererComponent | null>(null);

import type { ApplicationRuntime } from '../../application/runtime/runtimeServices';

const ids = {
  generate: () => crypto.randomUUID(),
};

const clone = {
  clone: <T>(value: T): T => structuredClone(value),
};

export const webApplicationRuntime: ApplicationRuntime = {
  ids,
  clone,
};

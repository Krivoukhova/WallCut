/**
 * Platform capabilities required by application use cases.
 * Implementations live in platform-specific infrastructure adapters.
 */
export interface IdGenerator {
  generate(): string;
}

export interface CloneService {
  clone<T>(value: T): T;
}

export type ApplicationRuntime = {
  ids: IdGenerator;
  clone: CloneService;
};

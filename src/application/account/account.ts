/** Stable local identity used to scope locally stored projects. */
export type Account = {
  id: string;
  createdAt: string;
  kind: 'user' | 'guest';
  email?: string;
};

import type { Account } from '../../application/account/account';

const GUEST_ACCOUNT_KEY = 'wallcut-guest-account-v1';
const LEGACY_GUEST_ACCOUNT_KEY = 'finance-shorts-guest-account-v1';

/** Creates a stable browser-local identity while accounts are disabled. */
export function getOrCreateGuestAccount(): Account {
  if (typeof window === 'undefined') {
    return {
      id: 'guest-server',
      kind: 'guest',
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const raw =
      window.localStorage.getItem(GUEST_ACCOUNT_KEY) ??
      window.localStorage.getItem(LEGACY_GUEST_ACCOUNT_KEY);

    if (raw) {
      const account = JSON.parse(raw) as Account;

      if (account?.id && account.kind === 'guest' && account.createdAt) {
        window.localStorage.setItem(GUEST_ACCOUNT_KEY, JSON.stringify(account));
        return account;
      }
    }
  } catch {
    // Recreate the guest identity if browser storage is invalid.
  }

  const account: Account = {
    id: `guest_${crypto.randomUUID()}`,
    kind: 'guest',
    createdAt: new Date().toISOString(),
  };

  window.localStorage.setItem(GUEST_ACCOUNT_KEY, JSON.stringify(account));

  return account;
}

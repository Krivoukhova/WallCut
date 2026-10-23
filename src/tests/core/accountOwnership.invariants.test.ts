import { getOrCreateGuestAccount } from '../../infrastructure/account/guestAccount';

export function runAccountOwnershipInvariantTests(): void {
  const guest = getOrCreateGuestAccount();
  if (guest.kind !== 'guest' || !guest.id || !guest.createdAt) {
    throw new Error('Projects must have a stable local guest owner while accounts are disabled');
  }
  if (guest.id === 'local-user') {
    throw new Error('The editor must not use a synthetic shared local-user owner');
  }
  const again = getOrCreateGuestAccount();
  if (typeof window !== 'undefined' && again.id !== guest.id) {
    throw new Error('Guest identity must remain stable across application starts');
  }
}

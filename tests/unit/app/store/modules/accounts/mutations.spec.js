import { state as accountsState } from '@/store/modules/accounts';
import accountsMutations from '@/store/modules/accounts/mutations';

describe('accounts mutations', () => {
  let state;

  beforeEach(() => {
    state = { ...accountsState };
  });

  describe('setAuthStatus', () => {
    it('should set auth status', () => {
      accountsMutations.setAuthStatus(state, true);

      expect(state.authorized).toBe(true);
    });
  });

  describe('setAccounts', () => {
    it('should set accounts', () => {
      accountsMutations.setAccounts(state, ['0x0', '0x1']);

      expect(state.accounts).toEqual(['0x0', '0x1']);
    });
  });

  describe('setSentStatus', () => {
    it('should set link sent status', () => {
      accountsMutations.setSentStatus(state, true);

      expect(state.linkSent).toBe(true);
    });
  });
});

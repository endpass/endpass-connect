import IdentityService from '@/service/identity';
import accountsActions from '@/store/modules/accounts/actions';

describe('accounts actions', () => {
  let dispatch;
  let commit;

  beforeEach(() => {
    jest.clearAllMocks();

    dispatch = jest.fn();
    commit = jest.fn();
  });

  describe('auth', () => {
    const email = 'foo@bar.baz';

    it('should auth user and change link status', async () => {
      expect.assertions(4);

      IdentityService.auth.mockResolvedValueOnce({
        success: true,
      });

      await accountsActions.auth({ commit }, email);

      expect(commit).toBeCalledTimes(3);
      expect(commit).toHaveBeenNthCalledWith(1, 'changeLoadingStatus', true);
      expect(commit).toHaveBeenNthCalledWith(2, 'setSentStatus', true);
      expect(commit).toHaveBeenNthCalledWith(3, 'changeLoadingStatus', false);
    });

    it('should set otp email if challenge type equals to otp', async () => {
      expect.assertions(4);

      IdentityService.auth.mockResolvedValueOnce({
        success: true,
        challenge: {
          challengeType: 'otp',
        },
      });

      await accountsActions.auth({ commit }, email);

      expect(commit).toBeCalledTimes(3);
      expect(commit).toHaveBeenNthCalledWith(1, 'changeLoadingStatus', true);
      expect(commit).toHaveBeenNthCalledWith(2, 'setOtpEmail', email);
      expect(commit).toHaveBeenNthCalledWith(3, 'changeLoadingStatus', false);
    });

    it('should throw error if auth response is falsy', async done => {
      expect.assertions(3);

      IdentityService.auth.mockResolvedValueOnce(false);

      try {
        await accountsActions.auth({ commit }, email);
      } catch (err) {
        done();
      }
      expect(commit).toBeCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, 'changeLoadingStatus', true);
      expect(commit).toHaveBeenNthCalledWith(2, 'changeLoadingStatus', false);
    });

    it('should throw error', async done => {
      expect.assertions(3);

      const error = new Error();

      IdentityService.auth.mockRejectedValueOnce(error);

      try {
        await accountsActions.auth({ commit }, email);
      } catch (err) {
        done();
      }
      expect(commit).toBeCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, 'changeLoadingStatus', true);
      expect(commit).toHaveBeenNthCalledWith(2, 'changeLoadingStatus', false);
    });
  });

  describe('cancelAuth', () => {
    it('should resolve current message and close dialog', async () => {
      expect.assertions(1);

      await accountsActions.cancelAuth({ dispatch });

      expect(dispatch).toBeCalledWith('resolveMessage', {
        status: false,
        message: 'Auth was canceled by user!',
      });
    });
  });

  describe('confirmAuth', () => {
    it('should resolve current message and close dialog', async () => {
      expect.assertions(1);

      await accountsActions.confirmAuth({ dispatch });

      expect(dispatch).toBeCalledWith('resolveMessage', {
        status: true,
      });
    });
  });

  describe('getAccounts', () => {
    it('should request accounts, bypass xpub accounts and set it', async () => {
      expect.assertions(1);

      IdentityService.getAccounts.mockResolvedValueOnce(['0x0', '0x1', 'xpub']);
      IdentityService.getAccountInfo.mockImplementation(acc => ({
        address: acc,
        type: 'StandardAccount',
      }));

      await accountsActions.getAccounts({ commit });

      expect(commit).toBeCalledWith('setAccounts', [
        { address: '0x0', type: 'StandardAccount' },
        { address: '0x1', type: 'StandardAccount' },
      ]);
    });

    it('should set empty accounts on error', async () => {
      expect.assertions(1);

      IdentityService.getAccounts.mockRejectedValueOnce();

      await accountsActions.getAccounts({ commit });

      expect(commit).toBeCalledWith('setAccounts', null);
    });
  });

  describe('getAccount', () => {
    it('should request account and return it', async () => {
      expect.assertions(2);

      const account = {
        address: '0x0',
      };

      IdentityService.getAccount.mockResolvedValueOnce(account);

      const res = await accountsActions.getAccount(null, '0x0');

      expect(IdentityService.getAccount).toBeCalledWith('0x0');
      expect(res).toEqual(account);
    });
  });

  describe('awaitAuthConfirm', () => {
    it('should await auth confirm and then request accounts', async () => {
      expect.assertions(1);

      IdentityService.awaitAuthConfirm.mockResolvedValueOnce(true);

      await accountsActions.awaitAuthConfirm({ dispatch });

      expect(dispatch).toBeCalledWith('getAccounts');
    });
  });

  describe('logout', () => {
    it('it should logout user with identity service', async () => {
      expect.assertions(4);

      IdentityService.logout.mockResolvedValueOnce();

      await accountsActions.logout({ dispatch, commit });

      expect(dispatch).toBeCalledWith('resolveMessage', {
        status: true,
        type: 'logout',
      });
      expect(commit).toBeCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, 'changeLoadingStatus', true);
      expect(commit).toHaveBeenNthCalledWith(2, 'changeLoadingStatus', false);
    });

    it('it should throw error', async done => {
      expect.assertions(2);

      IdentityService.logout.mockRejectedValueOnce();

      try {
        await accountsActions.logout({ dispatch, commit });
      } catch (err) {
        done();
      }

      expect(commit).toBeCalledTimes(2);
      expect(dispatch).not.toBeCalled();
    });
  });

  describe('awaitLogoutConfirm', () => {
    it('should await logout confirm', async () => {
      expect.assertions(3);

      IdentityService.awaitLogoutConfirm.mockResolvedValueOnce();

      await accountsActions.awaitLogoutConfirm({ commit });

      expect(commit).toBeCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, 'changeLoadingStatus', true);
      expect(commit).toHaveBeenNthCalledWith(2, 'changeLoadingStatus', false);
    });

    it('should throw error', async done => {
      expect.assertions(3);

      IdentityService.awaitLogoutConfirm.mockRejectedValueOnce();

      try {
        await accountsActions.awaitLogoutConfirm({ commit });
      } catch (err) {
        done();
      }

      expect(commit).toBeCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, 'changeLoadingStatus', true);
      expect(commit).toHaveBeenNthCalledWith(2, 'changeLoadingStatus', false);
    });
  });

  describe('getFirstPrivateAccount', () => {
    it('should returns first private account info from state', async () => {
      expect.assertions(1);

      const accounts = [
        {
          address: '0x0',
          type: 'StandardAccount',
        },
        {
          address: '0x1',
          type: 'PublicAccount',
        },
      ];
      const state = {
        accounts,
      };

      const res = await accountsActions.getFirstPrivateAccount({
        state,
        dispatch,
      });

      expect(res).toEqual(accounts[0]);
    });

    it('should returns null if there are no private accounts in state', async () => {
      expect.assertions(1);

      const accounts = [
        {
          address: '0x0',
          type: 'PublicAccount',
        },
        {
          address: '0x1',
          type: 'PublicAccount',
        },
      ];
      const state = {
        accounts,
      };

      const res = await accountsActions.getFirstPrivateAccount({
        state,
        dispatch,
      });

      expect(res).toBe(null);
    });

    it('should requests accounts if there are no accounts in the state', async () => {
      expect.assertions(1);

      const state = {
        accounts: null,
      };

      await accountsActions.getFirstPrivateAccount({
        state,
        dispatch,
      });

      expect(dispatch).toBeCalledWith('getAccounts');
    });
  });
});

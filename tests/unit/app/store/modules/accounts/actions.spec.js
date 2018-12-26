import IdentityService from '@/service/identity';
import accountsActions from '@@/app/src/store/modules/accounts/actions';
import { awaitMessageFromOpener } from '@@/util/message';

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
          challenge_type: 'otp',
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
    it('should send message and close dialog', async () => {
      expect.assertions(3);

      await accountsActions.cancelAuth({ dispatch });

      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'sendDialogMessage', {
        status: false,
        message: 'Auth was canceled by user!',
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, 'closeDialog');
    });
  });

  describe('confirmAuth', () => {
    it('should send message and close dialog', async () => {
      expect.assertions(3);

      await accountsActions.confirmAuth({ dispatch });

      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'sendDialogMessage', {
        status: true,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, 'closeDialog');
    });
  });

  describe('getAccounts', () => {
    it('should request accounts from identity service and set it', async () => {
      expect.assertions(1);

      const accounts = ['0x0', '0x1'];

      IdentityService.getAccounts.mockResolvedValueOnce(accounts);

      await accountsActions.getAccounts({ commit });

      expect(commit).toBeCalledWith('setAccounts', accounts);
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
      expect.assertions(6);

      IdentityService.logout.mockResolvedValueOnce();

      await accountsActions.logout({ dispatch, commit });

      expect(dispatch).toBeCalledTimes(2);
      expect(commit).toBeCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'sendDialogMessage', {
        status: true,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, 'closeDialog');
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

  describe('cancelLogout', () => {
    it('should cancel logout and send message with related data', async () => {
      expect.assertions(3);

      await accountsActions.cancelLogout({ dispatch });

      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'sendDialogMessage', {
        status: false,
        message: 'Logout was canceled by user!',
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, 'closeDialog');
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

  describe('awaitAuthMessage', () => {
    it('should await auth message from opener and set auth params', async () => {
      expect.assertions(1);

      const params = {
        foo: 'bar',
      };

      awaitMessageFromOpener.mockResolvedValueOnce(params);

      await accountsActions.awaitAuthMessage({ commit });

      expect(commit).toBeCalledWith('setAuthParams', params);
    });

    it('should await auth message from opener and does not set auth params if it is not empty', async () => {
      expect.assertions(1);

      awaitMessageFromOpener.mockResolvedValueOnce(null);

      await accountsActions.awaitAuthMessage({ commit });

      expect(commit).not.toBeCalled();
    });
  });
});

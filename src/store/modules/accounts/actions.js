import get from 'lodash/get';
import pick from 'lodash/pick';
import IdentityService from '@/service/identity';
import SettingsService from '@/service/settings';

const auth = async ({ state, commit }, email) => {
  commit('changeLoadingStatus', true);

  try {
    const res = await IdentityService.auth(
      email,
      get(state, 'authParams.redirectUrl'),
    );

    if (!res.success) throw new Error('Auth failed!');

    const type = get(res, 'challenge.challengeType');

    if (type === 'otp') {
      commit('setOtpEmail', email);
    } else {
      commit('setSentStatus', true);
    }
  } catch (err) {
    console.error(err);

    throw new Error('Something went wrong, try again later');
  } finally {
    commit('changeLoadingStatus', false);
  }
};

const confirmAuthViaOtp = async ({ commit }, { email, code }) => {
  commit('changeLoadingStatus', true);

  try {
    await IdentityService.otpAuth(email, code);
  } catch (err) {
    throw err;
  } finally {
    commit('changeLoadingStatus', false);
  }
};

const confirmAuth = ({ dispatch }) => {
  dispatch('resolveMessage', {
    status: true,
  });
};

const cancelAuth = ({ dispatch }) => {
  dispatch('resolveMessage', {
    status: false,
    message: 'Auth was canceled by user!',
  });
};

const getSettings = async ({ dispatch, commit }) => {
  const settings = await IdentityService.getSettings();

  if (!settings.lastActiveAccount) {
    const lastAccount = await dispatch('getFirstPrivateAccount');

    Object.assign(settings, {
      lastActiveAccount: get(lastAccount, 'address'),
    });
  }

  const mergedSettings = SettingsService.mergeSettings(settings);

  SettingsService.setLocalSettings(mergedSettings);

  commit('setSettings', {
    ...settings,
    ...mergedSettings,
  });

  return {
    ...settings,
    ...mergedSettings,
  };
};

const setSettings = async (ctx, payload) => {
  SettingsService.setLocalSettings(payload);
};

const updateSettings = async ({ commit, dispatch }, payload) => {
  commit('changeLoadingStatus', true);

  try {
    await dispatch('setSettings', payload);

    const res = await dispatch('getSettings');

    dispatch('resolveMessage', {
      status: true,
      type: 'update',
      payload: {
        activeAccount: res.lastActiveAccount,
        activeNet: res.net,
      },
    });
    dispatch('closeDialog');
  } catch (err) {
    throw new Error('Something went wrong, try again later');
  } finally {
    commit('changeLoadingStatus', false);
  }
};

const getAccounts = async ({ commit }) => {
  try {
    const res = await IdentityService.getAccounts();
    const accounts = await Promise.all(
      res.map(address => IdentityService.getAccountInfo(address)),
    );

    commit(
      'setAccounts',
      accounts.filter(account => !/^xpub/.test(account.address)),
    );
  } catch (err) {
    commit('setAccounts', null);
  }
};

const getAccount = async (ctx, address) => {
  const res = await IdentityService.getAccount(address);

  return res;
};

const getFirstPrivateAccount = async ({ state, dispatch }) => {
  if (!state.accounts) {
    await dispatch('getAccounts');
  }

  const { accounts } = state;

  return accounts.find(account => account.type !== 'PublicAccount');
};

const awaitAuthConfirm = async ({ dispatch }) => {
  await IdentityService.awaitAuthConfirm();
  await dispatch('getAccounts');
};

const awaitAccountCreate = async ({ commit }) => {
  const res = await IdentityService.awaitAccountCreate();

  commit('setAccounts', res);
};

const openCreateAccountPage = async () => {
  window.open('https://wallet-dev.endpass.com/#/');
};

const cancelLogout = async ({ dispatch }) => {
  dispatch('resolveMessage', {
    status: false,
    message: 'Logout was canceled by user!',
  });
  dispatch('closeDialog');
};

const awaitLogoutConfirm = async ({ commit }) => {
  commit('changeLoadingStatus', true);

  try {
    await IdentityService.awaitLogoutConfirm();
  } catch (err) {
    throw err;
  } finally {
    commit('changeLoadingStatus', false);
  }
};

const closeAccount = async ({ dispatch }) => {
  dispatch('resolveMessage', {
    status: true,
    type: 'close',
  });
  dispatch('closeDialog');
};

const logout = async ({ dispatch, commit }) => {
  commit('changeLoadingStatus', true);

  try {
    await IdentityService.logout();

    dispatch('resolveMessage', {
      status: true,
      type: 'logout',
    });
    dispatch('closeDialog');
  } catch (err) {
    console.error(err);

    throw new Error('Something went wrong, try again later');
  } finally {
    commit('changeLoadingStatus', false);
  }
};

export default {
  auth,
  cancelAuth,
  confirmAuth,
  confirmAuthViaOtp,
  getSettings,
  getAccount,
  getAccounts,
  getFirstPrivateAccount,
  openCreateAccountPage,
  awaitAccountCreate,
  awaitAuthConfirm,
  cancelLogout,
  awaitLogoutConfirm,
  setSettings,
  updateSettings,
  logout,
  closeAccount,
};

import identityService from '@@/service/identity';

const auth = async ({ commit }, email) => {
  commit('changeLoadingStatus', true);

  try {
    const res = await identityService.auth(email);

    if (!res) throw new Error('Auth failed!');

    commit('setSentStatus', true);
  } catch (err) {
    throw err;
  } finally {
    commit('changeLoadingStatus', false);
  }
};

const checkAuthStatus = async ({ commit, dispatch }) => {
  try {
    const res = await dispatch('getAccounts');

    commit('setAuthStatus', !!res);
  } catch (err) {
    commit('setAuthStatus', false);
  }
};

const getAccounts = async () => {
  const res = await identityService.getAccounts();

  return res;
};

const awaitAuthConfirm = async ({ commit }) => {
  await identityService.awaitAuthConfirm();

  commit('setAuthStatus', true);
};

export default {
  auth,
  checkAuthStatus,
  getAccounts,
  awaitAuthConfirm,
};

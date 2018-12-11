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

const getAccounts = async ({ commit }) => {
  try {
    const res = await identityService.getAccounts();

    commit('setAccounts', res);
  } catch (err) {
    commit('setAccounts', null);
  }
};

const getAccount = async (ctx, address) => {
  const res = await identityService.getAccount(address);

  return res;
};

const awaitAuthConfirm = async ({ dispatch }) => {
  await identityService.awaitAuthConfirm();

  await dispatch('getAccounts');
};

export default {
  auth,
  getAccounts,
  getAccount,
  awaitAuthConfirm,
};

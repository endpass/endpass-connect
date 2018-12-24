import actions from './actions';
import mutations from './mutations';
import getters from './getters';

const state = {
  authParams: null,
  linkSent: false,
  otpEmail: null,
  accounts: null,
};

export default {
  state,
  actions,
  mutations,
  getters,
};

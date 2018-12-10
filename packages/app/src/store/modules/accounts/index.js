import actions from './actions';
import mutations from './mutations';
import getters from './getters';

const state = {
  linkSent: false,
  authorized: null,
  accounts: [],
};

export default {
  state,
  actions,
  mutations,
  getters,
};

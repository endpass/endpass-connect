import mutations from './mutations';
import actions from './actions';
import getters from './getters';

export const state = {
  inited: false,
  loading: false,
};

export default {
  state,
  mutations,
  actions,
  getters,
};

import mutations from './mutations';
import actions from './actions';
import getters from './getters';

export const state = {
  awaits: null,
  resolution: null,
};

export default {
  state,
  mutations,
  actions,
  getters,
};

import Vue from 'vue';
import Vuex from 'vuex';

import accounts from './modules/accounts';
import core from './modules/core';
import requests from './modules/requests';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    core,
    accounts,
    requests,
  },
});

store
  .dispatch('getAccounts')
  .then(() => {
    /* eslint-disable-next-line */
    throw false;
  })
  .catch(() => {
    store.commit('changeInitStatus', true);
  });

export default store;

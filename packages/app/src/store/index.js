import Vue from 'vue';
import Vuex from 'vuex';
import accounts from './modules/accounts';
import core from './modules/core';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    core,
    accounts,
  },
});

export default store;

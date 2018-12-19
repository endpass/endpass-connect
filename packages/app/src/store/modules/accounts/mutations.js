import isEmpty from 'lodash/isEmpty';

const setAuthStatus = (state, status) => {
  state.authorized = status;
};

const setSentStatus = (state, status) => {
  state.linkSent = status;
};

const setAccounts = (state, accounts) => {
  state.accounts = isEmpty(accounts) ? accounts : [...accounts];
};

export default {
  setAuthStatus,
  setAccounts,
  setSentStatus,
};

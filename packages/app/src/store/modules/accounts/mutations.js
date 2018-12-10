const setAuthStatus = (state, status) => {
  state.authorized = status;
};

const setSentStatus = (state, status) => {
  state.linkSent = status;
};

const setAccounts = (state, accounts) => {
  state.accounts = accounts;
};

export default {
  setAuthStatus,
  setAccounts,
  setSentStatus,
};

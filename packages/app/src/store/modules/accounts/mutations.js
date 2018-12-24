import isEmpty from 'lodash/isEmpty';

const setAuthParams = (state, params) => {
  state.authParams = params;
};

const setAuthStatus = (state, status) => {
  state.authorized = status;
};

const setOtpEmail = (state, email) => {
  state.otpEmail = email;
};

const setSentStatus = (state, status) => {
  state.linkSent = status;
};

const setAccounts = (state, accounts) => {
  state.accounts = isEmpty(accounts) ? accounts : [...accounts];
};

export default {
  setAuthParams,
  setAuthStatus,
  setOtpEmail,
  setAccounts,
  setSentStatus,
};

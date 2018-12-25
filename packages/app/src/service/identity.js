import axios from 'axios';

const request = {
  get: url =>
    axios
      .get(url, {
        withCredentials: true,
      })
      .then(({ data }) => data),

  post: (url, body) => axios.post(url, body).then(({ data }) => data),
};

export const getSettings = () => request.get(`/identity/api/v1.1/settings`);

export const getOtpSettings = () =>
  request.get(`/identity/api/v1.1/settings/otp`);

export const getAccounts = () => request.get(`/identity/api/v1.1/accounts`);

export const getAccount = address =>
  request.get(`/identity/api/v1.1/account/${address}`);

export const getAccountInfo = address =>
  request.get(`/identity/api/v1.1/account/${address}/info`);

export const auth = (email, redirectUrl) => {
  const requestUrl = redirectUrl
    ? `/identity/api/v1.1/auth?redirect_uri=${encodeURIComponent(redirectUrl)}`
    : `/identity/api/v1.1/auth`;

  return request
    .post(requestUrl, {
      email,
    })
    .then(res => {
      if (!res.success) throw new Error(res.message);

      return res;
    });
};

export const otpAuth = (email, code) =>
  request
    .post(`/identity/api/v1.1/auth/token`, {
      challenge_type: 'otp',
      email,
      code,
    })
    .then(res => {
      if (!res.success) throw new Error(res.message);

      return res;
    });

export const awaitAuthConfirm = () =>
  new Promise(resolve => {
    const interval = setInterval(async () => {
      try {
        await getAccounts();

        clearInterval(interval);

        return resolve();
      } catch (err) {}
    }, 1500);
  });

export const logout = () => request.post('/identity/api/v1.1/logout');

export const awaitLogoutConfirm = () =>
  new Promise(resolve => {
    const interval = setInterval(async () => {
      try {
        await getAccounts();
      } catch (err) {
        clearInterval(interval);

        return resolve();
      }
    }, 1500);
  });

export const awaitAccountCreate = () =>
  new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const res = await getAccounts();

        if (res.filter(address => !/^xpub/.test(address)).length > 0) {
          clearInterval(interval);

          return resolve(res);
        }
      } catch (err) {
        return reject(err);
      }
    }, 1500);
  });

export default {
  getSettings,
  getOtpSettings,
  getAccount,
  getAccounts,
  getAccountInfo,
  auth,
  otpAuth,
  awaitAuthConfirm,
  logout,
  awaitLogoutConfirm,
  awaitAccountCreate,
};

import axios from 'axios';

const { url: identityBaseUrl } = ENV.identity;

const request = {
  get: url =>
    axios
      .get(url, {
        withCredentials: true,
      })
      .then(({ data }) => data),

  post: (url, body) =>
    axios
      .post(url, body, {
        withCredentials: true,
      })
      .then(({ data }) => data),
};

export const getSettings = () =>
  request.get(`${identityBaseUrl}/api/v1.1/settings`);

export const setSettings = settings =>
  request.post(`${identityBaseUrl}/api/v1.1/settings`, settings);

export const getOtpSettings = () =>
  request.get(`${identityBaseUrl}/api/v1.1/settings/otp`);

export const getAccounts = () =>
  request.get(`${identityBaseUrl}/api/v1.1/accounts`);

export const getAccount = address =>
  request.get(`${identityBaseUrl}/api/v1.1/account/${address}`);

export const getAccountInfo = address =>
  request.get(`${identityBaseUrl}/api/v1.1/account/${address}/info`);

export const auth = (email, redirectUrl) => {
  const requestUrl = redirectUrl
    ? `${identityBaseUrl}/api/v1.1/auth?redirect_uri=${encodeURIComponent(
        redirectUrl,
      )}`
    : `${identityBaseUrl}/api/v1.1/auth`;

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
    .post(`${identityBaseUrl}/api/v1.1/auth/token`, {
      challengeType: 'otp',
      email,
      code,
    })
    .then(res => {
      if (!res.success) throw new Error(res.message);

      return res;
    });

export const authWithGoogle = idToken =>
  request
    .get(
      `${identityBaseUrl}/api/v1.1/auth/google?token=${encodeURIComponent(
        idToken,
      )}`,
    )
    .then(res => {
      if (!res.success) throw new Error(res.message);
      return res;
    })
    .catch(err => {
      throw err.response.data;
    });

export const authWithGitHub = code =>
  request
    .get(
      `${identityBaseUrl}/api/v1.1/auth/github?code=${encodeURIComponent(
        code,
      )}`,
    )
    .then(res => {
      if (!res.success) throw new Error(res.message);
      return res;
    })
    .catch(err => {
      throw err.response.data;
    });

export const awaitAuthConfirm = () =>
  new Promise(resolve => {
    /* eslint-disable-next-line */
    const interval = setInterval(async () => {
      try {
        await getAccounts();

        clearInterval(interval);

        return resolve();
        /* eslint-disable-next-line */
      } catch (err) {}
    }, 1500);
  });

export const logout = () => request.post(`${identityBaseUrl}/api/v1.1/logout`);

export const awaitLogoutConfirm = () =>
  new Promise(resolve => {
    /* eslint-disable-next-line */
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
    /* eslint-disable-next-line */
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
  setSettings,
  auth,
  authWithGoogle,
  authWithGitHub,
  otpAuth,
  awaitAuthConfirm,
  logout,
  awaitLogoutConfirm,
  awaitAccountCreate,
};

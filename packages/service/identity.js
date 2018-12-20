class IdentityService {
  /* eslint-disable-next-line */
  getSettings() {
    return fetch(`${ENV.identity.url}/settings`, {
      method: 'GET',
      credentials: 'include',
    }).then(res => res.json());
  }

  /* eslint-disable-next-line */
  getAccounts() {
    return fetch(`${ENV.identity.url}/accounts`, {
      method: 'GET',
      credentials: 'include',
    }).then(res => res.json());
  }

  /* eslint-disable-next-line */
  getAccount(address) {
    return fetch(`${ENV.identity.url}/account/${address}`, {
      method: 'GET',
      credentials: 'include',
    }).then(res => res.json());
  }

  /* eslint-disable-next-line */
  getAccountInfo(address) {
    return fetch(`${ENV.identity.url}/account/${address}/info`, {
      method: 'GET',
      credentials: 'include',
    }).then(res => res.json());
  }

  /* eslint-disable-next-line */
  auth(email) {
    return fetch(`${ENV.identity.url}/auth`, {
      method: 'POST',
      body: JSON.stringify({
        email,
      }),
    })
      .then(res => res.json())
      .then(res => {
        if (!res.success) throw new Error(res.message);

        return res.success;
      });
  }

  awaitAuthConfirm() {
    return new Promise(resolve => {
      const interval = setInterval(async () => {
        try {
          await this.getAccounts();

          clearInterval(interval);

          return resolve();
        } catch (err) {}
      }, 1500);
    });
  }

  awaitAccountCreate() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const res = await this.getAccounts();

          if (res.filter(address => !/^xpub/.test(address)).length > 0) {
            clearInterval(interval);

            return resolve(res);
          }
        } catch (err) {
          return reject(err);
        }
      }, 1500);
    });
  }
}

export default new IdentityService();

const IDENTITY_SERVER_URL = 'https://identity-dev.endpass.com/api/v1.1';

class IdentityService {
  constructor() {
    this.interval = null;
  }

  /* eslint-disable-next-line */
  getAccounts() {
    return fetch(`${IDENTITY_SERVER_URL}/accounts`, {
      method: 'GET',
      credentials: 'include',
    }).then(res => res.json());
  }

  /* eslint-disable-next-line */
  auth(email) {
    return fetch(`${IDENTITY_SERVER_URL}/auth`, {
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

  startPolling(handler) {
    this.interval = setInterval(async () => {
      try {
        await this.getAccounts();

        handler(true);
      } catch (err) {
        handler(false);
      }
    }, 1500);
  }

  stopPolling() {
    clearInterval(this.interval);

    this.interval = null;
  }
}

export default new IdentityService();

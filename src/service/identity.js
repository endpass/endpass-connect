import axios from 'axios';

const IDENTITY_SERVER_URL = 'https://identity-dev.endpass.com/api/v1.1';

class IdentityService {
  constructor() {
    this.interval = null;
  }

  /* eslint-disable-next-line */
  getAccounts() {
    return axios.get(`${IDENTITY_SERVER_URL}/accounts`, {
      withCredentials: true,
    });
  }

  /* eslint-disable-next-line */
  async auth(email) {
    const { data } = await axios.post(`${IDENTITY_SERVER_URL}/auth`, {
      email,
    });

    if (!data.success) throw new Error(data.message);

    return data.success;
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

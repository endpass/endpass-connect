import identityService from '../service/identity';

const HOST_WINDOW_NAME = 'endpass-connect-host';
const DIALOG_WINDOW_NAME = 'endpass-connect-dialog';

class Connect {
  constructor({ origin, authUrl }) {
    this.origin = origin;
    this.authUrl = authUrl;
  }

  /**
   * Check auth status on endpass identity service
   * @returns {Promise<Boolean>} Auth status
   */
  /* eslint-disable-next-line */
  async status() {
    try {
      const res = await identityService.getAccounts();

      return !!res;
    } catch (err) {
      return false;
    }
  }

  auth() {
    const pos = {
      x: window.innerWidth / 2 - 200,
      y: 200,
    };
    const windowFeatures = [
      'chrome=yes',
      'centerscreen=yes',
      'resizable=no',
      'width=400',
      'height=600',
      `top=${pos.y}`,
      `left=${pos.x}`,
    ];

    window.name = HOST_WINDOW_NAME;
    window.open(this.authUrl, DIALOG_WINDOW_NAME, windowFeatures.join(','));

    return new Promise(resolve => {
      /* eslint-disable-next-line */
      window.addEventListener('message', message => {
        const data = JSON.parse(message.data);

        if (data.source === 'endpass-connect-dialog') {
          return resolve(data);
        }
      });
    });
  }
}

export default Connect;

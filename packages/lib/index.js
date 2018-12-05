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

  static switchBack() {
    window.open('', HOST_WINDOW_NAME);
    window.close();
  }

  /**
   * Boo Boo Boo
   */
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
      'heigth=600',
      `top=${pos.y}`,
      `left=${pos.x}`,
    ];

    window.name = HOST_WINDOW_NAME;
    window.open(this.authUrl, DIALOG_WINDOW_NAME, windowFeatures.join(','));

    return new Promise((resolve, reject) => {
      window.addEventListener('message', message => {
        console.log('handle message', message);
        return resolve(message);
      });
    });
  }
}

export default Connect;

import Web3 from 'web3';

import identityService from '../service/identity';
import { Emmiter, InpageProvider } from '../class';

const HOST_WINDOW_NAME = 'endpass-connect-host';
const DIALOG_WINDOW_NAME = 'endpass-connect-dialog';

class Connect {
  constructor({ authUrl }) {
    this.authUrl = authUrl;
    this.emmiter = new Emmiter();

    this.setupEmmiterEvents();
  }

  setupEmmiterEvents() {
    this.emmiter.on(
      InpageProvider.INPAGE_EVENTS.REQUEST,
      this.handleRequest.bind(this),
    );
    this.emmiter.on(
      InpageProvider.INPAGE_EVENTS.SETTINGS,
      this.handleRequest.bind(this),
    );
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

    // Auth popup closing must reject
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

  /* eslint-disable-next-line */
  async injectWeb3() {
    const inpageProvider = new InpageProvider(this.emmiter);

    if (!window.web3) {
      window.web3 = new Web3();
      window.web3.setProvider(inpageProvider);
      console.log('web3 old', window.web3);
    } else {
      console.log('web3 new 112');
    }
  }

  async handleRequest(request) {
    console.log('web3 request', request);
  }
}

export default Connect;

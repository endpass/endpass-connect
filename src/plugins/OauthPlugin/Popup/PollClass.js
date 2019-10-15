import ConnectError from '@endpass/class/ConnectError';
import queryStringToMap from '@endpass/utils/queryStringToMap';

const { ERRORS } = ConnectError;
const replaceReg = /^#\/?/;

export default class PollClass {
  constructor(url, popup) {
    this.url = url;
    this.popup = popup;

    this.promise = null;
    this.intervalId = null;

    popup.open();
    this.poll();
  }

  poll() {
    this.promise = new Promise((resolve, reject) => {
      this.intervalId = window.setInterval(() => {
        const target = this.popup.target();
        try {
          if (!target || target.closed !== false) {
            this.close();

            reject(ConnectError.create(ERRORS.POPUP_CLOSED));

            return;
          }

          if (
            target.location.href === this.url ||
            target.location.pathname === 'blank'
          ) {
            return;
          }

          const targetHash = target.location.hash.replace(replaceReg, '');
          const targetSearch = target.location.search.replace(replaceReg, '');

          const params = queryStringToMap(targetHash || targetSearch);

          if (Object.keys(params).length === 0) {
            return;
          }

          resolve(params);
          this.close();
        } catch (error) {}
      }, 500);
    });
  }

  cancel() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  close() {
    this.cancel();
    this.popup.close();
  }
}

import mapToQueryString from '@endpass/utils/mapToQueryString';
import queryStringToMap from '@endpass/utils/queryStringToMap';

const replaceReg = /^\#\/?/;

export default class PopupWindow {
  constructor(oauthServer, params, windowOptions = {}) {
    this.windowOptions = {
      height: windowOptions.height || 1000,
      width: windowOptions.width || 600,
    };
    this.id = 'endpass-oauth-authorize';

    const server = oauthServer || ENV.oauthServer;
    this.url = mapToQueryString(`${server}/auth`, params);
  }

  openPopup() {
    const { url, id, windowOptions } = this;
    this.window = window.open(
      url,
      id,
      `width=${windowOptions.width},height=${windowOptions.height}`,
    );
  }

  poll() {
    this.promise = new Promise((resolve, reject) => {
      this.intervalId = window.setInterval(() => {
        try {
          const popup = this.window;

          if (!popup || popup.closed !== false) {
            this.close();

            reject(new Error('The popup was closed'));

            return;
          }

          if (
            popup.location.href === this.url ||
            popup.location.pathname === 'blank'
          ) {
            return;
          }

          const popupHash = popup.location.hash.replace(replaceReg, '');
          const popupSearch = popup.location.search.replace(replaceReg, '');

          const params = queryStringToMap(popupHash || popupSearch);

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
    this.window.close();
  }

  static open(...args) {
    const popup = new this(...args);

    popup.openPopup();
    popup.poll();

    return popup.promise;
  }
}

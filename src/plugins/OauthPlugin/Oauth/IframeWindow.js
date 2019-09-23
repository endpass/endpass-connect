import ConnectError from '@endpass/class/ConnectError';
import mapToQueryString from '@endpass/utils/mapToQueryString';
import queryStringToMap from '@endpass/utils/queryStringToMap';

import DialogView from '@/class/Dialog/View';

const { ERRORS } = ConnectError;
const replaceReg = /^#\/?/;

export default class PopupWindow {
  constructor(oauthServer, params) {
    const server = oauthServer || ENV.oauthServer;

    this.promise = null;
    this.intervalId = null;
    this.url = mapToQueryString(`${server}/auth`, params);
    this.dialog = new DialogView({
      url: this.url,
      namespace: 'endpass-oauth-authorize',
    });
  }

  openPopup() {
    this.dialog.mount();
    this.dialog.show();
  }

  poll() {
    this.promise = new Promise((resolve, reject) => {
      this.intervalId = window.setInterval(() => {
        try {
          const popup = this.dialog.target;

          console.log(popup);

          if (!popup || popup.closed !== false) {
            this.close();

            reject(ConnectError.create(ERRORS.POPUP_CLOSED));

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
        } catch (err) {
          console.log('Window error: ', err);
        }
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
    this.dialog.hide();
  }

  static open(...args) {
    const popup = new this(...args);

    popup.openPopup();
    popup.poll();

    return popup.promise;
  }
}

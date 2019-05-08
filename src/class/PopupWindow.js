import mapToQueryString from '@endpass/utils/mapToQueryString';

function hashToMap(path) {
  const lines = path.replace(/^\#\/?/, '').split('&');
  const query = lines.reduce((map, line) => {
    const values = line.split('=');
    const key = values[0];
    if (key) {
      // eslint-disable-next-line
      map[key] = values[1];
    }
    return map;
  }, {});
  return query;
}

export default class PopupWindow {
  constructor(params, windowOptions = {}) {
    this.windowOptions = {
      height: windowOptions.height || 1000,
      width: windowOptions.width || 600,
    };
    this.id = 'endpass-oauth-authorize';
    const server = windowOptions.oauthServer || ENV.oauthServer;
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

          const params = hashToMap(popup.location.hash);

          resolve(params);
          this.close();
        } catch (error) {}
      }, 500);
    });
  }

  then(...args) {
    return this.promise.then(...args);
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

    return popup;
  }
}

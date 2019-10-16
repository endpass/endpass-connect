import IframeWindow from '@/plugins/OauthPlugin/View/IframeWindow';
import PopupWindow from '@/plugins/OauthPlugin/View/PopupWindow';
import BaseWindow from '@/plugins/OauthPlugin/View/BaseWindow';

export default class ViewStrategy {
  constructor({ messenger }) {
    this.messenger = messenger;
    this.popup = new BaseWindow({});
  }

  async open(url, options) {
    this.popup = new IframeWindow({ url, messenger: this.messenger });

    try {
      await this.popup.mount();
    } catch (e) {
      this.popup = new PopupWindow({ url, options });
      this.popup.mount();
    } finally {
      this.popup.show();
    }

    return this.popup;
  }

  ready(payload, req) {
    if (req.source === this.popup.target()) {
      this.popup.ready();
    }
  }

  close() {
    this.popup.close();
    this.popup = new BaseWindow({});
  }

  resize(payload) {
    this.popup.resize(payload);
  }
}

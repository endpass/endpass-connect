import getUrl from '@/plugins/OauthPlugin/Popup/getUrl';
import PollClass from '@/plugins/OauthPlugin/Popup/PollClass';

export default class PopupWindow {
  constructor(url, windowOptions = {}) {
    this.windowOptions = {
      height: windowOptions.height || 1000,
      width: windowOptions.width || 600,
    };
    this.id = 'endpass-oauth-authorize';
    this.url = url;
  }

  open() {
    const { url, id, windowOptions } = this;
    this.window = window.open(
      url,
      id,
      `width=${windowOptions.width},height=${windowOptions.height}`,
    );
  }

  close() {
    this.window.close();
  }

  target() {
    return this.window;
  }

  static openPoll(oauthServer, params, windowOptions) {
    const url = getUrl(oauthServer, params);
    const popup = new PopupWindow(url, windowOptions);
    const poll = new PollClass(url, popup);

    return poll.promise;
  }
}

import DialogView from '@/class/Dialog/View';
import PollClass from '@/plugins/OauthPlugin/Popup/PollClass';
import getUrl from '@/plugins/OauthPlugin/Popup/getUrl';

export default class IframeWindow {
  constructor(url) {
    this.dialog = new DialogView({
      url,
      namespace: 'endpass-oauth-authorize',
    });
  }

  open() {
    this.dialog.mount();
    this.dialog.show();
  }

  close() {
    this.dialog.hide();
  }

  target() {
    return this.dialog.target;
  }

  static openPoll(oauthServer, params) {
    const url = getUrl(oauthServer, params);

    const popup = new IframeWindow(url);
    const poll = new PollClass(url, popup);

    return poll.promise;
  }
}

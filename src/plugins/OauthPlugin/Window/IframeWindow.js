import DialogView from '@/class/Dialog/View';
import BaseWindow from '@/plugins/OauthPlugin/Window/BaseWindow';

export default class IframeWindow extends BaseWindow {
  constructor(url) {
    super(url);
    this.dialog = new DialogView({
      url,
      namespace: 'endpass-oauth-authorize',
    });

    // this.messenger = new Messenger();
    // this.messenger.setTarget(this.dialog);
    // this.messenger.subscribe((method, payload) => {
    //   if (method === 'resize') {
    //     this.resize(payload);
    //   }
    // });
  }

  open() {
    this.dialog.mount();
    this.dialog.show();
  }

  close() {
    this.dialog.close();
  }

  target() {
    return this.dialog.target;
  }

  resize(payload) {
    console.log('-- resize iframeWindow', payload);
    this.dialog.resize(payload);
  }
}

import DialogView from '@/class/Dialog/View';
import BaseWindow from '@/plugins/OauthPlugin/Window/BaseWindow';

export default class IframeWindow extends BaseWindow {
  constructor(props) {
    super(props);
    const { url, messenger } = props;
    this.dialog = new DialogView({
      url,
      namespace: 'endpass-oauth-authorize',
    });
    this.messenger = messenger;
  }

  open() {
    this.dialog.mount();
    this.messenger.setTarget(this.dialog.target);
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

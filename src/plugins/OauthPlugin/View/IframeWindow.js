import DialogView from '@/class/Dialog/View';
import BaseWindow from '@/plugins/OauthPlugin/View/BaseWindow';

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

  async mount() {
    this.dialog.mount();
    this.messenger.setTarget(this.dialog.target);
    await this.dialog.waitReady();
  }

  ready() {
    this.dialog.ready();
  }

  show() {
    this.dialog.show();
  }

  close() {
    this.dialog.close();
  }

  target() {
    return this.dialog.target;
  }

  resize(payload) {
    this.dialog.resize(payload);
  }
}

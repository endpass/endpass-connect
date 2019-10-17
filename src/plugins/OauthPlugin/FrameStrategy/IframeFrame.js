// @ts-check
import DialogView from '@/class/DialogView';
import BaseWindow from '@/plugins/OauthPlugin/FrameStrategy/BaseWindow';

export default class IframeFrame extends BaseWindow {
  /**
   *
   * @param {object} props
   * @param {string} props.url
   */
  constructor(props) {
    super(props);
    const { url } = props;
    this.dialogView = new DialogView({
      url,
      namespace: 'endpass-oauth-authorize',
    });
  }

  mount() {
    this.dialogView.mount();
  }

  async waitReady() {
    await this.dialogView.waitReady();
  }

  handleReady() {
    this.dialogView.handleReady();
  }

  open() {
    this.dialogView.show();
  }

  close() {
    this.dialogView.close();
  }

  get target() {
    return this.dialogView.target;
  }

  /**
   *
   * @param {object} payload
   */
  resize(payload) {
    this.dialogView.resize(payload);
  }
}

// @ts-check
import DialogView from '@/class/DialogView';
import BaseWindow from '@/plugins/OauthPlugin/FrameStrategy/BaseWindow';

export default class IframeFrame extends BaseWindow {
  constructor() {
    super();
    this.dialogView = new DialogView({
      namespace: 'endpass-oauth-authorize',
    });
  }

  /**
   * @param {string} url
   */
  mount(url) {
    this.dialogView.mount(url);
  }

  async waitReady() {
    await this.dialogView.waitReady();
  }

  handleReady() {
    this.dialogView.handleReady();
  }

  open() {
    this.dialogView.open();
  }

  destroy() {
    this.dialogView.destroy();
  }

  get target() {
    return this.dialogView.target;
  }

  /**
   *
   * @param {object} payload
   */
  resize(payload) {
    if (!this.dialogView) return;
    this.dialogView.resize(payload);
  }
}

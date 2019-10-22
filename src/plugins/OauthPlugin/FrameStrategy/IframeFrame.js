// @ts-check
import DialogView from '@/class/DialogView';
import BaseWindow from '@/plugins/OauthPlugin/FrameStrategy/BaseWindow';

export default class IframeFrame extends BaseWindow {
  constructor() {
    super();
    this.dialogView = null;
  }

  /**
   * @param {string} url
   */
  init(url) {
    this.dialogView = new DialogView({
      url,
      namespace: 'endpass-oauth-authorize',
    });
  }

  mount() {
    if (!this.dialogView) return;
    this.dialogView.mount();
  }

  async waitReady() {
    if (!this.dialogView) return;
    await this.dialogView.waitReady();
  }

  handleReady() {
    if (!this.dialogView) return;
    this.dialogView.handleReady();
  }

  open() {
    if (!this.dialogView) return;
    this.dialogView.open();
  }

  close() {
    if (!this.dialogView) return;
    this.dialogView.destroy();
    this.dialogView = null;
  }

  get target() {
    if (!this.dialogView) return null;
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

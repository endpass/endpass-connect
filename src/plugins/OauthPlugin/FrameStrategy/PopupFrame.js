// @ts-check
import BaseWindow from '@/plugins/OauthPlugin/FrameStrategy/BaseWindow';

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 1000;

export default class PopupFrame extends BaseWindow {
  /**
   * @param {string} url
   */
  constructor(url) {
    super(url);
    this.window = null;
  }

  open() {
    this.window = window.open(
      this.url,
      'endpass-oauth-authorize',
      `width=${DEFAULT_WIDTH},height=${DEFAULT_HEIGHT}`,
    );
  }

  close() {
    if (!this.window) return;
    this.window.close();
  }

  get target() {
    return this.window;
  }
}

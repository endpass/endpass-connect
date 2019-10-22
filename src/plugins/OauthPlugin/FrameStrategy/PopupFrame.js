// @ts-check
import BaseWindow from '@/plugins/OauthPlugin/FrameStrategy/BaseWindow';

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 1000;

export default class PopupFrame extends BaseWindow {
  constructor() {
    super();
    this.url = '';
    this.window = null;
  }

  initFallback() {
    this.window = window.open(
      '',
      'endpass-oauth-authorize',
      'width=1,height=1',
    );
    if (this.window) {
      this.window.document.write('Please wait, loading...');
      this.window.blur();
    }
    window.focus();
  }

  /**
   *
   * @param {string} url
   */
  init(url) {
    this.url = url;
  }

  open() {
    if (!this.window) {
      this.window = window.open(
        this.url,
        'endpass-oauth-authorize',
        `width=${DEFAULT_WIDTH},height=${DEFAULT_HEIGHT}`,
      );
      return;
    }
    if (this.window.closed) {
      throw new Error('Popup was closed');
    }
    this.window.location.href = this.url;
    this.window.resizeTo(DEFAULT_WIDTH, DEFAULT_HEIGHT);
    this.window.focus();
  }

  close() {
    if (!this.window) return;
    this.window.close();
    this.window = null;
  }

  get target() {
    return this.window;
  }
}

// @ts-check
import ConnectError from '@endpass/class/ConnectError';
import BaseWindow from '@/plugins/OauthPlugin/FrameStrategy/BaseWindow';

const { ERRORS } = ConnectError;
const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 1000;

export default class PopupFrame extends BaseWindow {
  constructor() {
    super();
    this.popupId = 'endpass-oauth-authorize';
    this.url = '';
    this.window = null;
  }

  prepare() {
    this.window = window.open('', this.popupId, 'width=1,height=1');
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
        this.popupId,
        `width=${DEFAULT_WIDTH},height=${DEFAULT_HEIGHT}`,
      );
      return;
    }
    if (this.window.closed) {
      throw ConnectError.create(ERRORS.POPUP_CLOSED);
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

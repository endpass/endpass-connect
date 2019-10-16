import BaseWindow from '@/plugins/OauthPlugin/Window/BaseWindow';

export default class PopupWindow extends BaseWindow {
  constructor(url, windowOptions = {}) {
    super(url);
    this.windowOptions = {
      height: windowOptions.height || 1000,
      width: windowOptions.width || 600,
    };
    this.id = 'endpass-oauth-authorize';
  }

  open() {
    const { url, id, windowOptions } = this;
    this.window = window.open(
      url,
      id,
      `width=${windowOptions.width},height=${windowOptions.height}`,
    );
  }

  close() {
    this.window.close();
  }

  target() {
    return this.window;
  }
}

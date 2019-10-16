import BaseWindow from '@/plugins/OauthPlugin/View/BaseWindow';

export default class PopupWindow extends BaseWindow {
  constructor(props) {
    super(props);
    const { options = {} } = props;
    this.windowOptions = {
      height: options.height || 1000,
      width: options.width || 600,
    };
    this.id = 'endpass-oauth-authorize';
  }

  show() {
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

const LABEL_DEFAULT = 'Sign in with Endpass';

export default class LoginButton {
  constructor({ rootElement, buttonLabel, isButtonLight, clickHandler }) {
    this.rootElement = rootElement || document.body;
    this.buttonLabel = buttonLabel || LABEL_DEFAULT;
    this.isButtonLight = isButtonLight;
    this.clickHandler = this.wrapCallback(clickHandler);

    this.buttonElement = null;
  }

  mount() {
    const text = document.createTextNode(this.buttonLabel);
    const icon = document.createElement('i');
    icon.classList.add('endpass-oauth-icon');

    this.buttonElement = document.createElement('button');
    this.buttonElement.classList.add('endpass-oauth-button');
    if (this.isButtonLight) {
      this.buttonElement.classList.add('endpass-oauth-button-light');
    }
    this.buttonElement.appendChild(icon);
    this.buttonElement.appendChild(text);
    this.buttonElement.setAttribute('data-test', 'login-button');
    this.buttonElement.addEventListener('click', this.clickHandler);

    this.rootElement.appendChild(this.buttonElement);
  }

  unmount() {
    this.buttonElement.removeEventListener('click', this.clickHandler);
    this.rootElement.removeChild(this.buttonElement);
  }

  wrapCallback(clickHandler) {
    return async function() {
      this.classList.add('is-loading');
      await clickHandler();
      this.classList.remove('is-loading');
      this.disabled = true;
    };
  }
}

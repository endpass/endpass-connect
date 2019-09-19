const LABEL_DEFAULT = 'Sign in with Endpass';

export default class LoginButton {
  constructor({ rootElement, buttonLabel, isButtonLight, clickHandler }) {
    this.rootElement = rootElement || document.body;
    this.buttonLabel = buttonLabel || LABEL_DEFAULT;
    this.isButtonLight = isButtonLight;
    this.clickHandler = clickHandler;

    this.buttonElement = null;
  }

  mount() {
    const buttonCssClass = this.isButtonLight
      ? 'endpass-oauth-light'
      : 'endpass-oauth';
    const text = document.createTextNode(this.buttonLabel);
    const icon = document.createElement('i');
    icon.classList.add('endpass-oauth-icon');

    this.buttonElement = document.createElement('button');
    this.buttonElement.classList.add(buttonCssClass);
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
}

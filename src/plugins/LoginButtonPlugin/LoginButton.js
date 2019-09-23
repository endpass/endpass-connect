const LABEL_DEFAULT = 'Sign in with Endpass';

export default class LoginButton {
  constructor({ element, label, isLight, onClick }) {
    this.element = element || document.body;
    this.label = label || LABEL_DEFAULT;
    this.isLight = isLight;
    this.onClick = this.wrapCallback(onClick);

    this.buttonElement = null;
  }

  mount() {
    this.buttonElement = document.createElement('button');
    this.buttonElement.innerHTML = `<i class="endpass-oauth-icon"></i>${this.label}`;
    this.buttonElement.classList.add('endpass-oauth-button');
    if (this.isLight) {
      this.buttonElement.classList.add('endpass-oauth-button-light');
    }

    this.buttonElement.setAttribute('data-test', 'login-button');
    this.buttonElement.addEventListener('click', this.onClick);

    this.element.appendChild(this.buttonElement);
  }

  unmount() {
    this.buttonElement.removeEventListener('click', this.onClick);
    this.buttonElement.parentElement.removeChild(this.buttonElement);
  }

  wrapCallback(onClick) {
    const self = this;

    return async function() {
      const { buttonElement } = self;
      if (!buttonElement.classList.contains('is-loading')) {
        buttonElement.classList.add('is-loading');
        await onClick();
        buttonElement.classList.remove('is-loading');
        buttonElement.disabled = true;
      }
    };
  }
}

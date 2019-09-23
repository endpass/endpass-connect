const LABEL_DEFAULT = 'Sign in with Endpass';

export default class LoginButton {
  constructor({ element, label, isLight, onClick }) {
    this.element =
      typeof element === 'string' ? document.querySelector(element) : element;
    this.label = label || LABEL_DEFAULT;
    this.isLight = isLight;
    this.onClick = this.wrapCallback(onClick);

    this.buttonElement = null;
  }

  mount() {
    const template = `
      <button
        data-hash
        data-test="login-button"
        class="endpass-oauth-button${
          this.isLight ? ' endpass-oauth-button-light' : ''
        }"
      >
        <i class="endpass-oauth-icon"></i>
        ${this.label}
      </button>
    `;

    this.element.insertAdjacentHTML('afterBegin', template);
    this.buttonElement = this.element.querySelector('button');
    this.buttonElement.addEventListener('click', this.onClick);
    return this.element;
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
        const error = await onClick();
        buttonElement.classList.remove('is-loading');
        if (!error) {
          buttonElement.disabled = true;
        }
      }
    };
  }
}

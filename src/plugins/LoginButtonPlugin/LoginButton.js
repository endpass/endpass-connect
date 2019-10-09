const LABEL_DEFAULT = 'Sign in with Endpass';

export default class LoginButton {
  /**
   * @param {object} options
   * @param {HTMLElement|string} options.element render place
   * @param {string=} [options.label]
   * @param {boolean=} [options.isLight]
   * @param {function=} [options.onClick]
   */
  constructor({ element, label = LABEL_DEFAULT, isLight = false, onClick }) {
    /** @type {HTMLElement} */
    this.element =
      typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) {
      throw new Error(
        'Not defined "element" in options. Please define "element" option as String or HTMLElement',
      );
    }

    this.label = label;
    this.isLight = isLight;
    this.onClick = onClick;

    this.onButtonClick = this.onButtonClick.bind(this);

    this.buttonElement = null;
  }

  /**
   *
   * @return {HTMLElement}
   */
  mount() {
    if (this.buttonElement) {
      return this.buttonElement;
    }

    const template = `
      <button
        data-hash
        data-test="login-button"
        class="endpass-oauth-button ${
          this.isLight ? 'endpass-oauth-button-light' : ''
        }"
      >
        <i class="endpass-oauth-icon"></i>
        ${this.label}
      </button>
    `;

    this.element.insertAdjacentHTML('afterBegin', template);
    this.buttonElement = this.element.querySelector('button');
    this.buttonElement.addEventListener('click', this.onButtonClick);

    return this.buttonElement;
  }

  unmount() {
    if (!this.buttonElement) {
      return;
    }

    this.buttonElement.removeEventListener('click', this.onButtonClick);
    this.buttonElement.parentElement.removeChild(this.buttonElement);
    this.buttonElement = null;
  }

  /**
   *
   * @return {boolean}
   */
  isMounted() {
    return !!this.buttonElement;
  }

  async onButtonClick() {
    const { buttonElement, onClick } = this;

    if (!onClick || buttonElement.classList.contains('is-loading')) {
      return;
    }

    buttonElement.classList.add('is-loading');
    const { error } = await this.onClick();
    buttonElement.classList.remove('is-loading');
    if (!error) {
      buttonElement.disabled = true;
    }
  }
}

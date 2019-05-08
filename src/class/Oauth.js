import axios from 'axios';
import tokenProvider from 'axios-token-interceptor';
import { isNumeric } from '@endpass/utils/numbers';
import PopupWindow from '@/class/PopupWindow';

export const STORE_KEYS = {
  TOKEN: 'token',
  EXPIRES: 'expires',
  SCOPE: 'scope',
};

const { TOKEN, EXPIRES, SCOPE } = STORE_KEYS;

function getRandomState() {
  return (
    Math.random()
      .toString(36)
      .substring(5) +
    Math.random()
      .toString(36)
      .substring(5)
  );
}

export default class Oauth {
  constructor({ clientId, scopes, popupHeight, popupWidth, state }) {
    this.clientId = clientId;
    this.axiosInstance = null;
    this.popupHeight = popupHeight || 1000;
    this.popupWidth = popupWidth || 600;
    this.state = state || getRandomState();

    const scopeValue = scopes.join(' ');

    const oldScope = this.getStoredValue(SCOPE);
    if (oldScope === scopeValue) {
      this.setStoredValue({
        name: TOKEN,
        value: this.getStoredValue(TOKEN),
      });

      const expiredValue = this.getStoredValue(EXPIRES)
        ? parseInt(this.getStoredValue(EXPIRES), 10)
        : null;
      this.setStoredValue({
        name: EXPIRES,
        value: expiredValue,
      });
    } else {
      this.setStoredValue({
        name: SCOPE,
        value: scopeValue,
      });
    }
    this.checkTokenValidity();
  }

  async init() {
    if (!this.getStoredValue(TOKEN)) {
      await this.authorize();
    }
    this.createAxiosInstance();
  }

  /**
   * Authorizes and returns resulting authorization token
   * @private
   */
  async authorize() {
    const { state } = this;

    const authorizationResult = await PopupWindow.open(
      {
        client_id: this.clientId,
        scope: this.getStoredValue(SCOPE),
        state,
        response_type: 'token',
      },
      {
        height: this.popupHeight,
        width: this.popupWidth,
      },
    );
    if (authorizationResult.state !== state) {
      throw new Error('Authorization failed: state check unsuccessful');
    }
    this.setStoredValue({
      name: EXPIRES,
      value: new Date().getTime() + authorizationResult.expires_in * 1000,
    });

    this.setStoredValue({
      name: TOKEN,
      value: authorizationResult.access_token,
    });
  }

  logout() {
    this.clearStoredValue(SCOPE);
    this.clearStoredValue(TOKEN);
    this.clearStoredValue(EXPIRES);
  }

  setStoredValue({ name, value }) {
    localStorage.setItem(`${this.clientId}${name}`, value);
  }

  getStoredValue(name) {
    return localStorage.getItem(`${this.clientId}${name}`);
  }

  clearStoredValue(name) {
    localStorage.removeItem(`${this.clientId}${name}`);
  }

  /**
   * Returns saved authorization token or calls for freash authorization
   * @private
   * @returns {String} authVersion token
   */
  async getToken() {
    this.checkTokenValidity();
    if (!this.getStoredValue(TOKEN)) {
      await this.authorize();
    }
    return this.getStoredValue(TOKEN);
  }

  /**
   * Returns axios instance with token providing interceptor
   * @returns {Axios} axios instance
   */
  createAxiosInstance() {
    this.axiosInstance = axios.create();
    this.axiosInstance.interceptors.request.use(
      tokenProvider({
        getToken: () => this.getToken(),
      }),
    );
  }

  /**
   * Sets oauth popup parameters
   * @param {Object} params Parameters object
   * @param {Number} [width] Oauth popup width
   * @param {Number} [height] Oauth popup height
   */
  setPopupParams({ height, width }) {
    this.popupWidth = isNumeric(width) ? width : this.popupWidth;
    this.popupHeight = isNumeric(height) ? height : this.popupHeight;
  }

  checkTokenValidity() {
    if (new Date().getTime() >= this.getStoredValue(EXPIRES)) {
      this.clearStoredValue(TOKEN);
      this.clearStoredValue(EXPIRES);
    }
  }

  /**
   * Makes api request with authorization token
   * @param {Object} [options] Request parameters object
   * @param {String} url Request url
   * @param {String} method Request http method
   * @param {Object} [params] - Request parameters
   * @param {Object} [headers] - Request headers
   * @param {Object|string} [data] - Request body
   * @returns {Promise} Request promise
   */
  async request(options) {
    if (!this.axiosInstance) {
      await this.createAxiosInstance();
    }
    return this.axiosInstance({
      ...options,
    });
  }
}

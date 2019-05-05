import tokenProvider from 'axios-token-interceptor';
import axios from 'axios';
import { PopupWindow } from '@/class';

export default class Oauth {
  constructor({ clientId, scopes, popupHeight, popupWidth, state }) {
    this.clientId = clientId;
    this.scope = scopes.join(' ');
    this.axiosInstance = null;
    this.popupHeight = popupHeight || 1000;
    this.popupWidth = popupWidth || 600;
    this.state = state || null;
    const oldScope = this.getStoredValue('scope');
    if (oldScope === this.scope) {
      this.token = this.getStoredValue('token');
      this.expires = this.getStoredValue('expires')
        ? parseInt(this.getStoredValue('expires'), 10)
        : null;
    } else {
      this.setStoredValue('scope', this.scope);
    }
    this.checkTokenValidity();
  }

  async init() {
    if (!this.token) {
      await this.authorize();
    }
    this.createAxiousInstance();
  }

  /**
   * Authorizes and returns resulting authorization token
   * @private
   */
  async authorize() {
    const state =
      this.state ||
      Math.random()
        .toString(36)
        .substring(5) +
        Math.random()
          .toString(36)
          .substring(5);

    const authorizationResult = await PopupWindow.open(
      {
        client_id: this.clientId,
        scope: this.scope,
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
      name: 'expires',
      value: new Date().getTime() + authorizationResult.expires_in * 1000,
    });

    this.setStoredValue({
      name: 'token',
      value: authorizationResult.access_token,
    });
  }

  logout() {
    this.clearStoredValue('scope');
    this.clearStoredValue('token');
    this.clearStoredValue('expires');
  }

  setStoredValue({ name, value }) {
    this[name] = value;
    localStorage.setItem(`${this.clientId}${name}`, value);
  }

  getStoredValue(name) {
    return localStorage.getItem(`${this.clientId}${name}`);
  }

  clearStoredValue(name) {
    this[name] = null;
    localStorage.removeItem(`${this.clientId}${name}`);
  }

  /**
   * Returns saved authorization token or calls for freash authorization
   * @private
   * @returns {String} authVersion token
   */
  async getToken() {
    this.checkTokenValidity();
    if (!this.token) {
      await this.authorize();
    }
    return this.token;
  }

  /**
   * Returns axios instance with token providing interceptor
   * @returns {Axios} axios instance
   */
  createAxiousInstance() {
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
    this.popupWidth = isNumber(width) ? width : this.popupWidth;
    this.popupHeight = isNumber(height) ? height : this.popupHeight;
  }

  checkTokenValidity() {
    if (new Date().getTime() >= this.expires) {
      this.clearStoredValue('token');
      this.clearStoredValue('expires');
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
      await this.createAxiousInstance();
    }
    return this.axiosInstance({
      ...options,
    });
  }
}

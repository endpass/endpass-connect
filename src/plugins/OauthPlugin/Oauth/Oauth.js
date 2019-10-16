// @ts-check
import axios from 'axios';
import tokenProvider from 'axios-token-interceptor';
// @ts-ignore
import { isNumeric } from '@endpass/utils/numbers';
// @ts-ignore
import LocalStorage from '@endpass/class/LocalStorage';

/** @typedef {string} Token */

export default class Oauth {
  /**
   *
   * @param {object} params Params for constructor
   * @param {string} params.clientId Client id for oauth server
   * @param {string[]} params.scopes Scopes list
   * @param {OauthStrategy} params.strategy Strategy for get TokenObject
   * @param {number=} [params.popupHeight] Window window height
   * @param {number=} [params.popupWidth] Window window width
   * @param {string=} [params.oauthServer] Url for oauth server
   */
  constructor({
    clientId,
    scopes,
    popupHeight,
    popupWidth,
    oauthServer,
    strategy,
  }) {
    this.clientId = clientId;
    this.oauthServer = oauthServer || ENV.oauthServer;
    /** @type {number} */
    this.popupHeight = popupHeight || 1000;
    /** @type {number} */
    this.popupWidth = popupWidth || 600;
    this.axiosInstance = this.createAxiosInstance();
    this.strategy = strategy;

    this.scopesString = scopes.sort().join(' ');
    const storedData = this.getTokenObjectFromStore();

    if (storedData && storedData.scope !== this.scopesString) {
      LocalStorage.remove(this.clientId);
    }
  }

  /**
   * Initiate token
   * @return {Promise<string | null>}
   */
  async init() {
    const token = await this.getToken();
    return token;
  }

  /**
   * Authorizes and update token object
   * @private
   * @return {Promise<TokenObject>}
   */
  async updateTokenObject() {
    const tokenObject = await this.strategy.getTokenObject(
      this.oauthServer,
      {
        client_id: this.clientId,
        scope: this.scopesString,
      },
      {
        height: this.popupHeight,
        width: this.popupWidth,
      },
    );

    if (tokenObject) {
      LocalStorage.save(this.clientId, tokenObject);
    }

    return tokenObject;
  }

  logout() {
    LocalStorage.remove(this.clientId);
  }

  /**
   * Return stored token object
   * @private
   * @return {TokenObject | null}
   */
  getTokenObjectFromStore() {
    return LocalStorage.load(this.clientId);
  }

  /**
   * Returns saved authorization token or calls for fresh authorization
   * @private
   * @return {Promise<Token>} authVersion token
   */
  async getToken() {
    let tokenObject = this.getTokenObjectFromStore();

    if (tokenObject === null || new Date().getTime() >= tokenObject.expires) {
      LocalStorage.remove(this.clientId);
      tokenObject = await this.updateTokenObject();
    }

    return tokenObject.token;
  }

  /**
   * Returns axios instance with token providing interceptor
   * @private
   * @returns {import('axios').AxiosInstance} instance instance
   */
  createAxiosInstance() {
    const instance = axios.create();
    instance.interceptors.request.use(
      tokenProvider({
        getToken: () => this.getToken(),
      }),
    );
    return instance;
  }

  /**
   * Sets oauth popup parameters
   * @param {object} params Parameters object
   * @param {number=} [params.width] Oauth popup width
   * @param {number=} [params.height] Oauth popup height
   */
  setPopupParams({ height = this.popupHeight, width = this.popupWidth }) {
    this.popupWidth = isNumeric(width) ? width : this.popupWidth;
    this.popupHeight = isNumeric(height) ? height : this.popupHeight;
  }

  /**
   * Makes api request with authorization token
   * @param {import('axios').AxiosRequestConfig} [options] Request parameters object
   */
  request(options) {
    return this.axiosInstance({
      ...options,
    });
  }
}

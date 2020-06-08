// @ts-check
import axios from 'axios';
import tokenProvider from 'axios-token-interceptor';
import LocalStorage from '@endpass/class/LocalStorage';
import ConnectError from '@/class/ConnectError';
import Polling from '@/plugins/OauthPlugin/Oauth/Polling';

const { ERRORS } = ConnectError;

const DEFAULT_KEY = 'endpass-oauth';
const AUTH_STATUS_KEY = `${DEFAULT_KEY}-hash`;
const SIGNED_KEY = `${DEFAULT_KEY}-signed`;

export default class Oauth {
  /**
   * @param {OauthOptionsWithStrategy} params Params for constructor
   */
  constructor({ clientId, oauthServer, frameStrategy, oauthStrategy }) {
    this.clientId = clientId;
    this.oauthServer = oauthServer || ENV.oauthServer;
    this.axiosInstance = this.createAxiosInstance();

    this.frameStrategy = frameStrategy;
    this.oauthStrategy = oauthStrategy;
  }

  /**
   * @returns {string}
   */
  getStoreKey(key = DEFAULT_KEY) {
    return `${key}:${this.clientId}`;
  }

  /**
   * Authorizes and update token object
   * @private
   * @return {Promise<TokenObject>}
   */
  async createTokenObject() {
    const params = {
      client_id: this.clientId,
    };
    const poll = new Polling(this.frameStrategy);

    this.frameStrategy.prepare();
    await this.oauthStrategy.prepare(this.oauthServer, params);
    const { url } = this.oauthStrategy;
    await this.frameStrategy.open(url);
    const pollResult = await poll.getResult(url);

    if (pollResult.state !== this.oauthStrategy.state) {
      throw ConnectError.create(
        ERRORS.OAUTH_AUTHORIZE,
        'State check unsuccessful',
      );
    }

    if (pollResult.error) {
      throw ConnectError.create(
        ERRORS.OAUTH_AUTHORIZE,
        `Authorization failed: ${pollResult.error}`,
      );
    }

    if (!pollResult.code) {
      throw ConnectError.create(
        ERRORS.OAUTH_AUTHORIZE,
        'Authorization failed: code is not passed!',
      );
    }

    const tokenObject = await this.oauthStrategy.getTokenObject(
      this.oauthServer,
      pollResult.code,
      params,
    );

    return tokenObject;
  }

  /**
   * @param {object} params
   * @param {number} params.code
   * @param {string} params.hash
   */
  changeAuthStatus({ code, hash = '' }) {
    const storedKey = this.getStoreKey(AUTH_STATUS_KEY);
    const lastStoredValue = LocalStorage.load(storedKey);
    LocalStorage.save(storedKey, hash);

    const isEqual = hash === lastStoredValue;
    const isHashChanged = lastStoredValue && !isEqual;

    if (code === 401 || isHashChanged) {
      this.dropAuthStatus();
      this.dropToken();
    }
  }

  dropAuthStatus() {
    LocalStorage.remove(this.getStoreKey(AUTH_STATUS_KEY));
  }

  /**
   * @returns {void}
   */
  dropToken() {
    LocalStorage.remove(this.getStoreKey(SIGNED_KEY));
    LocalStorage.remove(this.getStoreKey());
  }

  /**
   * Return stored token object
   * @private
   * @return {TokenObject | null}
   */
  getTokenObjectFromStore() {
    return LocalStorage.load(this.getStoreKey());
  }

  /**
   * @return {string}
   */
  getSignedString() {
    return LocalStorage.load(this.getStoreKey(SIGNED_KEY));
  }

  /**
   * @param {string} str
   */
  setSignedString(str) {
    LocalStorage.save(this.getStoreKey(SIGNED_KEY), str);
  }

  /**
   * Returns saved authorization token or calls for fresh authorization
   * @private
   * @return {Promise<Token>} authVersion token
   */
  async getToken() {
    let tokenObject = this.getTokenObjectFromStore();

    if (!tokenObject || Date.now() >= tokenObject.expires) {
      this.dropToken();
      tokenObject = await this.createTokenObject();
      LocalStorage.save(this.getStoreKey(), tokenObject);
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
   * Makes api request with authorization token
   * @param {OauthRequestOptions} params
   * @returns {import('axios').AxiosPromise<any>}
   */
  request({ scopes, ...options }) {
    return this.axiosInstance(options);
  }
}

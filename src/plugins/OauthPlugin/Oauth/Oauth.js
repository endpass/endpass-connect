// @ts-check
import axios from 'axios';
import tokenProvider from 'axios-token-interceptor';
import LocalStorage from '@endpass/class/LocalStorage';
import ConnectError from '@endpass/class/ConnectError';
import Polling from '@/plugins/OauthPlugin/Oauth/Polling';

/** @typedef {string} Token */

const { ERRORS } = ConnectError;

export default class Oauth {
  /**
   *
   * @param {object} params Params for constructor
   * @param {string} params.clientId Client id for oauth server
   * @param {string[]=} params.scopes Scopes list
   * @param {string=} params.oauthServer Url for oauth server
   * @param {import('@/plugins/OauthPlugin/Oauth/OauthPkceStrategy').default} params.oauthStrategy Oauth Strategy for get TokenObject
   * @param {import('@/plugins/OauthPlugin/FrameStrategy').default} params.frameStrategy Frame Strategy for show frame
   */
  constructor({ clientId, scopes, oauthServer, frameStrategy, oauthStrategy }) {
    this.clientId = clientId;
    this.oauthServer = oauthServer || ENV.oauthServer;
    this.axiosInstance = this.createAxiosInstance();

    this.frameStrategy = frameStrategy;
    this.oauthStrategy = oauthStrategy;
    this.scopesString = '';

    this.setScopes(scopes);
  }

  /**
   * Initiate token
   * @deprecated
   * @param {object} params Parameters object
   * @param {string[]} params.scopes - Array of authorization scopes
   */
  async loginWithOauth(params) {
    this.setScopes(params.scopes);
    await this.getToken();
  }

  /**
   *
   * @param {string[]=} scopes
   */
  setScopes(scopes) {
    if (!scopes) {
      return;
    }
    this.scopesString = scopes.sort().join(' ');
    this.checkScopes();
  }

  checkScopes() {
    const tokenObject = this.getTokenObjectFromStore();
    const now = new Date().getTime();

    if (
      !tokenObject ||
      tokenObject.scope !== this.scopesString ||
      now >= tokenObject.expires
    ) {
      LocalStorage.remove(this.clientId);
    }
  }

  /**
   * Authorizes and update token object
   * @private
   * @return {Promise<TokenObject>}
   */
  async updateTokenObject() {
    const params = {
      client_id: this.clientId,
      scope: this.scopesString,
    };
    const poll = new Polling(this.frameStrategy);

    this.frameStrategy.prepare();

    await this.oauthStrategy.init(this.oauthServer, params);
    const { url } = this.oauthStrategy;

    await this.frameStrategy.open(url);
    const pollResult = await poll.result(url);

    if (pollResult.state !== this.oauthStrategy.state) {
      throw ConnectError.create(ERRORS.OAUTH_AUTHORIZE_STATE);
    }

    if (pollResult.error) {
      throw ConnectError.create(
        ERRORS.OAUTH_AUTHORIZE_STATE,
        `Authorization failed: ${pollResult.error}`,
      );
    }

    const tokenObject = await this.oauthStrategy.getTokenObject(
      pollResult.code,
      params,
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
    this.checkScopes();
    let tokenObject = this.getTokenObjectFromStore();

    if (!tokenObject) {
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
   * Makes api request with authorization token
   * @template {import('axios').AxiosRequestConfig} T
   * @param {{scopes?: string[]} & T} params
   */
  request({ scopes, ...options }) {
    this.setScopes(scopes);
    return this.axiosInstance(options);
  }
}

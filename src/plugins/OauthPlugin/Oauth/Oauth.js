// @ts-check
import axios from 'axios';
import tokenProvider from 'axios-token-interceptor';
import LocalStorage from '@endpass/class/LocalStorage';
import ConnectError from '@endpass/class/ConnectError';
import PollClass from '@/plugins/OauthPlugin/Oauth/PollClass';

/** @typedef {string} Token */

const { ERRORS } = ConnectError;

export default class Oauth {
  /**
   *
   * @param {object} params Params for constructor
   * @param {string} params.clientId Client id for oauth server
   * @param {string[]} params.scopes Scopes list
   * @param {string=} params.oauthServer Url for oauth server
   * @param {import('@/plugins/OauthPlugin/Oauth/OauthPkceStrategy').default} params.oauthStrategy Oauth Strategy for get TokenObject
   * @param {import('@/plugins/OauthPlugin/FrameStrategy').default} params.frameStrategy Frame Strategy for show frame
   */
  constructor({ clientId, scopes, oauthServer, frameStrategy, oauthStrategy }) {
    this.clientId = clientId;
    this.oauthServer = oauthServer || ENV.oauthServer;
    this.axiosInstance = this.createAxiosInstance();

    this.scopesString = scopes.sort().join(' ');
    const storedData = this.getTokenObjectFromStore();

    if (storedData && storedData.scope !== this.scopesString) {
      LocalStorage.remove(this.clientId);
    }

    this.frameStrategy = frameStrategy;
    this.oauthStrategy = oauthStrategy;
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
    const params = {
      client_id: this.clientId,
      scope: this.scopesString,
    };

    await this.oauthStrategy.init(this.oauthServer, params);
    const poll = new PollClass(this.oauthStrategy.url, this.frameStrategy);

    const pollResult = await poll.result();

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
   * Makes api request with authorization token
   * @param {import('axios').AxiosRequestConfig} [options] Request parameters object
   */
  request(options) {
    return this.axiosInstance({
      ...options,
    });
  }
}

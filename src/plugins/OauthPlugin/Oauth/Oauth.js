// @ts-check
import axios from 'axios';
import tokenProvider from 'axios-token-interceptor';
import LocalStorage from '@endpass/class/LocalStorage';
import ConnectError from '@/class/ConnectError';
import Polling from '@/plugins/OauthPlugin/Oauth/Polling';

const { ERRORS } = ConnectError;

export default class Oauth {
  /**
   * @param {OauthOptionsWithStrategy} params Params for constructor
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
   * @returns {string}
   */
  get storeId() {
    return `endpass-oauth:${this.clientId}`;
  }

  /**
   * @param {string[]=} scopes
   * @returns {void}
   */
  setScopes(scopes) {
    if (!scopes) {
      return;
    }
    this.scopesString = scopes.sort().join(' ');
    this.checkScopes();
  }

  /**
   * @returns {void}
   */
  checkScopes() {
    const tokenObject = this.getTokenObjectFromStore();

    if (
      !tokenObject ||
      tokenObject.scope !== this.scopesString ||
      Date.now() >= tokenObject.expires
    ) {
      this.dropToken();
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

    const tokenObject = await this.oauthStrategy.getTokenObject(
      this.oauthServer,
      pollResult.code,
      params,
    );

    if (tokenObject) {
      LocalStorage.save(this.storeId, tokenObject);
    }

    return tokenObject;
  }

  /**
   * @param {object} params
   * @param {number} params.code
   * @param {string} params.hash
   */
  changeAuthStatus({ code, hash = '' }) {
    const storedKey = `endpass-oauth-hash:${this.clientId}`;
    const storedId = LocalStorage.load(storedKey);
    LocalStorage.save(storedKey, hash);

    const isEqual = hash === storedId;

    if (code === 401 || !isEqual) {
      this.dropToken();
    }
  }

  /**
   * @returns {void}
   */
  dropToken() {
    LocalStorage.remove(this.storeId);
  }

  /**
   * Return stored token object
   * @private
   * @return {TokenObject | null}
   */
  getTokenObjectFromStore() {
    return LocalStorage.load(this.storeId);
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
   * @param {OauthRequestOptions} params
   * @returns {import('axios').AxiosPromise<any>}
   */
  request({ scopes, ...options }) {
    this.setScopes(scopes);
    if (!this.scopesString) {
      throw ConnectError.create(ERRORS.OAUTH_SCOPES_NOT_DEFINED);
    }
    return this.axiosInstance(options);
  }
}

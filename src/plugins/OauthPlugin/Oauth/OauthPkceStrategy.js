// @ts-check
import axios from 'axios';
import mapToQueryString from '@endpass/utils/mapToQueryString';
import pkce from '@/plugins/OauthPlugin/Oauth/pkce';

/** @typedef {{ client_id: string }} StrategyParams */

export default class OauthPkceStrategy {
  /**
   *
   * @param {object} options
   * @param {import('@/class/Context').default} options.context
   */
  constructor({ context }) {
    this.context = context;

    this.url = '';
    this.state = '';
    this.codeVerifier = '';
  }

  /**
   *
   * @private
   * @param {string} oauthServer
   * @param {object} fields
   * @return {Promise<object>}
   */
  async exchangeCodeToToken(oauthServer, fields) {
    const formData = Object.keys(fields).reduce((form, key) => {
      form.append(key, fields[key]);
      return form;
    }, new FormData());

    // old flow used iframe for make token exchange
    const url = `${oauthServer}/oauth/token`;

    const { data } = await axios.post(url, formData);
    return data;
  }

  /**
   * Prepare pkce structure and create url for open redirects
   * @param {string} oauthServer
   * @param {StrategyParams} params
   */
  async prepare(oauthServer, params) {
    // Create and store a random "state" value
    const state = pkce.generateRandomString();
    // Create and store a new PKCE code_verifier (the plaintext random secret)
    const codeVerifier = pkce.generateRandomString();
    // Hash and base64-urlencode the secret to use as the challenge
    const codeChallenge = await pkce.challengeFromVerifier(codeVerifier);

    const server = oauthServer || ENV.oauthServer;
    const url = mapToQueryString(`${server}/oauth/auth`, {
      ...params,
      state,
      response_type: 'code',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    this.url = url;
    this.state = state;
    this.codeVerifier = codeVerifier;
  }

  /**
   * @param {string} oauthServer
   * @param {string} code
   * @param {StrategyParams} params
   * @return {Promise<TokenObject>}
   */
  async getTokenObject(oauthServer, code, params) {
    const tokenResult = await this.exchangeCodeToToken(oauthServer, {
      grant_type: 'authorization_code',
      code,
      client_id: params.client_id,
      code_verifier: this.codeVerifier,
    });

    return {
      token: tokenResult.access_token,
      expires: new Date().getTime() + tokenResult.expires_in * 1000,
    };
  }
}

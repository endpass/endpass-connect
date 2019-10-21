// @ts-check
import ConnectError from '@endpass/class/ConnectError';
import mapToQueryString from '@endpass/utils/mapToQueryString';
import pkce from '@/plugins/OauthPlugin/Oauth/pkce';
import { MESSENGER_METHODS } from '@/constants';

const { ERRORS } = ConnectError;

/** @typedef {{ client_id: string, scope: string }} StrategyParams */

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

  // TODO: after implement public api use this method and drop dialog
  // /**
  //  *
  //  * @private
  //  * @param {string} oauthServer
  //  * @param {object} fields
  //  * @return {Promise<object>}
  //  */
  // static async exchangeCodeToToken(oauthServer, fields) {
  //   const formData = Object.keys(fields).reduce((form, key) => {
  //     form.append(key, fields[key]);
  //     return form;
  //   }, new FormData());
  //
  //   const url = `${oauthServer}/token`;
  //
  //   const { data } = await axios.post(url, formData);
  //   return data;
  // }

  /**
   *
   * @private
   * @param {object} fields
   * @return {Promise<object>}
   */
  async exchangeCodeToToken(fields) {
    const { payload, status, error } = await this.context.ask(
      MESSENGER_METHODS.EXCHANGE_TOKEN_REQUEST,
      fields,
    );

    if (!status) {
      throw ConnectError.create(error || ERRORS.OAUTH_AUTHORIZE);
    }
    return payload;
  }

  /**
   * Prepare pkce structure and create url for open redirects
   * @param {string} oauthServer
   * @param {StrategyParams} params
   */
  async init(oauthServer, params) {
    // Create and store a random "state" value
    const state = pkce.generateRandomString();
    // Create and store a new PKCE code_verifier (the plaintext random secret)
    const codeVerifier = pkce.generateRandomString();
    // Hash and base64-urlencode the secret to use as the challenge
    const codeChallenge = await pkce.challengeFromVerifier(codeVerifier);

    const server = oauthServer || ENV.oauthServer;
    const url = mapToQueryString(`${server}/auth`, {
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
   *
   * @param {string} code
   * @param {StrategyParams} params
   * @return {Promise<{expires: number, scope: string, token: string}>}
   */
  async getTokenObject(code, params) {
    const tokenResult = await this.exchangeCodeToToken({
      grant_type: 'authorization_code',
      code,
      client_id: params.client_id,
      code_verifier: this.codeVerifier,
    });

    return {
      token: tokenResult.access_token,
      expires: new Date().getTime() + tokenResult.expires_in * 1000,
      scope: params.scope,
    };
  }
}

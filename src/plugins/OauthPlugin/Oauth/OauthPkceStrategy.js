// @ts-check
import ConnectError from '@endpass/class/ConnectError';
// @ts-ignore
import mapToQueryString from '@endpass/utils/mapToQueryString';
import PollClass from '@/plugins/OauthPlugin/Oauth/PollClass';
import pkce from '@/plugins/OauthPlugin/Oauth/pkce';
import { MESSENGER_METHODS } from '@/constants';

const { ERRORS } = ConnectError;

/** @type {OauthStrategy} */
export default class OauthPkceStrategy {
  /**
   *
   * @param {object} options
   * @param {InstanceType<typeof import('@/class/Context').default>} options.context
   * @param {InstanceType<typeof import('@/plugins/OauthPlugin/View/ViewStrategy').default>} options.view
   */
  constructor({ context, view }) {
    this.context = context;
    this.view = view;
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
   * @param {object} params
   * @return {Promise<{codeVerifier: string, state: string, url: string}>}
   */
  async challenge(oauthServer, params) {
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
    return {
      url,
      state,
      codeVerifier,
    };
  }

  /**
   *
   * @param {string} oauthServer
   * @param {object} params
   * @param {object} options
   * @return {Promise<{expires: number, scope: string, token: string}>}
   */
  async getTokenObject(oauthServer, params, options) {
    const { url, state, codeVerifier } = await this.challenge(
      oauthServer,
      params,
    );
    const popup = await this.view.open(url, options);
    const poll = new PollClass(url, popup);

    const popupResult = await poll.result();

    this.view.close();

    if (popupResult.state !== state) {
      throw ConnectError.create(ERRORS.OAUTH_AUTHORIZE_STATE);
    }

    if (popupResult.error) {
      throw ConnectError.create(
        ERRORS.OAUTH_AUTHORIZE_STATE,
        `Authorization failed: ${popupResult.error}`,
      );
    }

    const tokenResult = await this.exchangeCodeToToken({
      grant_type: 'authorization_code',
      code: popupResult.code,
      client_id: params.client_id,
      code_verifier: codeVerifier,
    });

    return {
      token: tokenResult.access_token,
      expires: new Date().getTime() + tokenResult.expires_in * 1000,
      scope: params.scope,
    };
  }
}

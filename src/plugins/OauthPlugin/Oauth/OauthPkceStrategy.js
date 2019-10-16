// @ts-check
// @ts-ignore
import ConnectError from '@endpass/class/ConnectError';
import pkce from '@/plugins/OauthPlugin/Oauth/pkce';
import { MESSENGER_METHODS } from '@/constants';

// eslint-disable-next-line
import Context from '@/class/Context';
import getUrl from '@/plugins/OauthPlugin/Oauth/getUrl';
import PollClass from '@/plugins/OauthPlugin/Oauth/PollClass';

const { ERRORS } = ConnectError;

/** @type {OauthStrategy} */
export default class OauthPkceStrategy {
  /**
   *
   * @param {object} options
   * @param {InstanceType<typeof Context>} options.context
   * @param {object} options.PopupClass
   * @param {object} options.messenger
   */
  constructor({ context, PopupClass, messenger }) {
    this.context = context;
    this.PopupClass = PopupClass;
    this.popup = null;
    this.messenger = messenger;
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
   *
   * @param {object} payload
   */
  resize(payload) {
    if (!this.popup) {
      return;
    }
    this.popup.resize(payload);
  }

  /**
   * @param {string} oauthServer server url
   * @param {object} params params for oauth authorize
   * @param {string} params.client_id client id for oauth server
   * @param {string} params.scope scope for oauth
   * @param {object=} [options] options for popup
   * @return {Promise<TokenObject>}
   */
  async getTokenObject(oauthServer, params, options) {
    // Create and store a random "state" value
    const state = pkce.generateRandomString();
    // Create and store a new PKCE code_verifier (the plaintext random secret)
    const codeVerifier = pkce.generateRandomString();
    // Hash and base64-urlencode the secret to use as the challenge
    const codeChallenge = await pkce.challengeFromVerifier(codeVerifier);

    const url = getUrl(oauthServer, {
      ...params,
      state,
      response_type: 'code',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    this.popup = new this.PopupClass({
      url,
      options,
      messenger: this.messenger,
    });
    const poll = new PollClass(url, this.popup);

    const popupResult = await poll.promise;

    this.popup = null;

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

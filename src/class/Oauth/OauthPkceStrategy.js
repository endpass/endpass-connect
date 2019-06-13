// @ts-check

import axios from 'axios';
import PopupWindow from '@/class/PopupWindow';
import pkce from '@/class/Oauth/pkce';

/** @type {OauthStrategy} */
export default class OauthPkceStrategy {
  /**
   *
   * @private
   * @param {string} oauthServer
   * @param {object} fields
   * @return {Promise<object>}
   */
  static async exchangeCodeToToken(oauthServer, fields) {
    const formData = Object.keys(fields).reduce((form, key) => {
      form.append(key, fields[key]);
      return form;
    }, new FormData());

    const url = `${oauthServer}/token`;

    const { data } = await axios.post(url, formData);
    return data;
  }

  /**
   * @param {string} oauthServer server url
   * @param {object} params params for oauth authorize
   * @param {string} params.client_id client id for oauth server
   * @param {string} params.scope scope for oauth
   * @param {object=} [options] options for popup
   * @return {Promise<TokenObject>}
   */
  static async getTokenObject(oauthServer, params, options) {
    // Create and store a random "state" value
    const state = pkce.generateRandomString();
    // Create and store a new PKCE code_verifier (the plaintext random secret)
    const codeVerifier = pkce.generateRandomString();
    // Hash and base64-urlencode the secret to use as the challenge
    const codeChallenge = await pkce.challengeFromVerifier(codeVerifier);

    const popupResult = await PopupWindow.open(
      oauthServer,
      {
        ...params,
        state,
        response_type: 'code',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      },
      options,
    );

    if (popupResult.state !== state) {
      throw new Error('Authorization failed: state check unsuccessful');
    }

    if (popupResult.error) {
      throw new Error(`Authorization failed: ${popupResult.error}`);
    }

    const tokenResult = await OauthPkceStrategy.exchangeCodeToToken(
      oauthServer,
      {
        grant_type: 'authorization_code',
        code: popupResult.code,
        client_id: params.client_id,
        code_verifier: codeVerifier,
      },
    );

    return {
      token: tokenResult.access_token,
      expires: new Date().getTime() + tokenResult.expires_in * 1000,
      scope: params.scope,
    };
  }
}

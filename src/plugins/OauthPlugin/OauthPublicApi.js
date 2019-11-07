// @ts-check

/** @param {OauthPlugin} oauthPlugin */
export default oauthPlugin => ({
  /**
   * Fetch user data via oauth
   * @deprecated
   * @param {object} params Parameters object
   * @param {string[]} params.scopes - Array of authorization scopes
   * @returns {Promise<void>}
   */
  async loginWithOauth(params) {
    await oauthPlugin.loginWithOauth(params);
  },

  /**
   * Clears instance scopes and token
   * @returns {Promise<void>}
   * @throws {Error} If not authorized yet;
   */
  async logoutFromOauth() {
    oauthPlugin.logout();
  },

  /**
   * Fetch user data via oauth
   * @param {OauthRequestOptions} options Request parameters object
   * @returns {Promise<any>} Request promise
   * @throws {Error} If not authorized yet;
   */
  async request(options) {
    return oauthPlugin.request(options);
  },
});

// @ts-check

export default /** @param {OauthPlugin} oauthPlugin */ oauthPlugin => ({
  /**
   * Fetch user data via oauth
   * @deprecated
   * 
   * @param {object} params Parameters object
   * @param {string[]} params.scopes - Array of authorization scopes
   * 
   * @returns {Promise<void>}
   */
  async loginWithOauth(params) {
    await oauthPlugin.loginWithOauth(params);
  },

  /**
   * Clears instance scopes and token
   * @throws {Error} If not authorized yet;
   * 
   * @returns {Promise<void>}
   */
  async logoutFromOauth() {
    oauthPlugin.logout();
  },

  /**
   * Fetch user data via oauth
   * @throws {Error} If not authorized yet;
   * 
   * @param {ContextOptions} options Request parameters object
   * 
   * @returns {Promise<any>} Request promise
   */
  async request(options) {
    return oauthPlugin.request(options);
  },
});

// @ts-check

/** @param {OauthPlugin} oauthPlugin */
export default oauthPlugin => ({
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

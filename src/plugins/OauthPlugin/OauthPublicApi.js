export default oauthPlugin => ({
  /**
   * Fetch user data via oauth
   * @param {object} params Parameters object
   * @param {string[]} params.scopes - Array of authorization scopes
   */
  async loginWithOauth(params) {
    await oauthPlugin.loginWithOauth(params);
  },

  /**
   * Clears instance scopes and token
   * @throws {Error} If not authorized yet;
   */
  async logoutFromOauth() {
    oauthPlugin.logout();
  },

  /**
   * Fetch user data via oauth
   * @param {object} [options] Request parameters object
   * @param {string} options.url Request url
   * @param {string} options.method Request http method
   * @param {object} [options.params] - Request parameters
   * @param {object} [options.headers] - Request headers
   * @param {object|string} [options.data] - Request body
   * @returns {Promise} Request promise
   * @throws {Error} If not authorized yet;
   */
  async request(options) {
    return oauthPlugin.request(options);
  },
});

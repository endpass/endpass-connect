export default oauthPlugin => ({
  /**
   * Fetch user data via oauth
   * @param {object} params Parameters object
   * @param {number} [params.popupWidth] Oauth popup width
   * @param {number} [params.popupHeight] Oauth popup height
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
   * Sets oauth popup parameters
   * @param {object} params Parameters object
   * @param {number} [params.width] Oauth popup width
   * @param {number} [params.height] Oauth popup height
   * @throws {Error} If not authorized yet;
   */
  async setOauthPopupParams(params) {
    oauthPlugin.setPopupParams(params);
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

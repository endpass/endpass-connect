export default loginButtonPlugin => ({
  /**
   * @param {object} params Parameters object
   * @param {string|HTMLElement} [params.element]
   * @param {function=} [params.onLogin]
   * @param {string=} [params.label]
   * @param {boolean=} [params.isLight]
   * @return {Promise<LoginButton>}
   */
  createLoginButton(params) {
    return loginButtonPlugin.createLoginButton(params);
  },
});

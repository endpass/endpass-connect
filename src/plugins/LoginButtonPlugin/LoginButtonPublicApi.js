export default {
  createLoginButton: loginButtonPlugin =>
    /**
     * @param {object} params Parameters object
     * @param {string|HTMLElement} [params.element]
     * @param {function} [params.onLogin]
     * @param {string} [params.label]
     * @param {boolean} [params.isLight]
     * @return {Promise<LoginButton>}
     */
    params => loginButtonPlugin.createLoginButton(params),
};

export default {
  createLoginButton: loginButtonPlugin =>
    /**
     * @param {object} params Parameters object
     * @param {HTMLElement} [params.rootElement]
     * @param {function} [params.onLogin]
     * @param {string} [params.buttonLabel]
     * @param {boolean} [params.isButtonLight]
     * @return {Promise<LoginButton>}
     */
    params => loginButtonPlugin.createLoginButton(params),
};

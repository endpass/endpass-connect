export default {
  mountLoginButton: loginButtonPlugin =>
    /**
     * @param {object} params Parameters object
     * @param {string} params.oauthClientId Oauth Client ID
     * @param {HTMLElement} params.element
     * @param {function} [params.callback]
     * @return {Promise<Element>}
     */
    params => loginButtonPlugin.mount(params),
};

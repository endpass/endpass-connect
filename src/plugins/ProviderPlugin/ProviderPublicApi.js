import { PLUGIN_METHODS } from '@/constants';

export default providerPlugin => ({
  /**
   * Opens Endpass Connect application with user settings
   * If type of response equals to "logout" – user makes logout
   * If type of response equals to "update" – settings in injected provider will
   * be updated and promise will return updated settings
   * @public
   * @throws {Error} If update failed
   * @returns {Promise<object>}
   */
  async openAccount() {
    await providerPlugin.context.executeMethod(
      PLUGIN_METHODS.CONTEXT_AUTHORIZE,
    );

    return providerPlugin.openProviderAccount();
  },
  /**
   * Sets settings to current `web3` provider injected to page with `injectWeb3`
   * method
   * @public
   * @param {object} payload
   * @param {string} payload.activeAccount Current account check summed address
   * @param {string} payload.activeNet Active network ID
   */
  async setProviderSettings(payload) {
    await providerPlugin.context.executeMethod(
      PLUGIN_METHODS.CONTEXT_SET_PROVIDER_SETTINGS,
      payload,
    );
  },
  /**
   * Requests user settings from injected bridge and returns formatted data
   * Settings includes last active account and network id
   * @public
   * @throws {Error} If settings can not be resolved
   * @returns {Promise<object>} Account data
   */
  async getAccountData() {
    await providerPlugin.context.executeMethod(
      PLUGIN_METHODS.CONTEXT_AUTHORIZE,
    );
    const res = await providerPlugin.getProviderAccountData();
    return res;
  },
  /**
   * Return Inpage provider for inner requests and returns it back
   * @public
   * @param {Web3.Provider} provider Web3-friendly provider
   * @returns {Promise<Web3.Provider>} Inpage provider for injections into application
   *  Web3 instance
   */
  async getProvider() {
    return providerPlugin.getInpageProvider();
  },
});

export default walletPlugin => ({
  /**
   * Show dialog for create wallet
   * @return {Promise<object>}
   */
  async createWallet() {
    return walletPlugin.createWallet();
  },
});

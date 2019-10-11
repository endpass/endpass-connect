export default walletPlugin => ({
  /**
   * Show dialog for create wallet
   * @return {Promise<object>}
   */
  async generateWallet() {
    return walletPlugin.generateWallet();
  },
});

export default documentPlugin => ({
  /**
   * Show dialog for create document
   * @return {Promise<void>}
   */
  async createDocument() {
    return documentPlugin.createDocument();
  },
});

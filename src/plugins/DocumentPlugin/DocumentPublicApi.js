export default documentPlugin => ({
  /**
   * Show dialog for create document
   * @return {Promise<object>}
   */
  async createDocument() {
    return documentPlugin.createDocument();
  },
});

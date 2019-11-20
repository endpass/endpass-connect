export default documentPlugin => ({
  /**
   * Show dialog for create document
   * @param {object?} params
   * @param {string} params.defaultDocumentType
   * @return {Promise<object>}
   */
  async createDocument(params) {
    return documentPlugin.createDocument(params);
  },
});

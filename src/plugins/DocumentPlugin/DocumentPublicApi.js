export default documentPlugin => ({
  /**
   * Show dialog for create document
   * @return {Promise<void>}
   */
  createDocument() {
    return documentPlugin.createDocument();
  },
});

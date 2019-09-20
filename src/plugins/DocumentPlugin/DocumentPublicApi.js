export default documentPlugin => ({
  createDocument(params) {
    return documentPlugin.createDocument(params);
  },
});

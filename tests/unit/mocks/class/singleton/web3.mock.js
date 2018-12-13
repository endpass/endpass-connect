jest.mock('@@/class/singleton/web3', () => ({
  eth: {
    sendSignedTransaction: jest.fn(),
  },
}));

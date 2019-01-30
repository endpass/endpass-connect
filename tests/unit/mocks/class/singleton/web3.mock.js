jest.mock('@/class/singleton/web3', () => ({
  eth: {
    sendSignedTransaction: jest.fn(),
  },
  providers: {
    HttpProvider: jest.fn(),
  },
  setProvider: jest.fn(),
}));

jest.mock('@/service/identity', () => ({
  getAccounts: jest.fn(),
  getAccount: jest.fn(),
  auth: jest.fn(),
  awaitAuthConfirm: jest.fn(),
}));

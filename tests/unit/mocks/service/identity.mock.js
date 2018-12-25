jest.mock('@/service/identity', () => ({
  getSettings: jest.fn(),
  getOtpSettings: jest.fn(),
  getAccount: jest.fn(),
  getAccounts: jest.fn(),
  getAccountInfo: jest.fn(),
  auth: jest.fn(),
  otpAuth: jest.fn(),
  awaitAuthConfirm: jest.fn(),
  logout: jest.fn(),
  awaitLogoutConfirm: jest.fn(),
  awaitAccountCreate: jest.fn(),
}));

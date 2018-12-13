jest.mock('@@/class/Wallet', () => {
  class Wallet {}

  Wallet.prototype.sign = jest.fn();
  Wallet.prototype.getNextNonce = jest.fn();
  Wallet.prototype.signTransaction = jest.fn();

  return Wallet;
});

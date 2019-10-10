import { WalletPlugin } from '@/plugins/WalletPlugin';
import { MESSENGER_METHODS } from '@/constants';

describe('Wallet plugin', () => {
  let plugin;
  const options = {};

  const context = {
    ask: jest.fn(),
    executeMethod: jest.fn(),
    isLogin: true,
  };

  const createPlugin = () => {
    const inst = new WalletPlugin(options, context);
    inst.init();
    return inst;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    plugin = createPlugin();
  });

  describe('initial', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create instance of plugin', () => {
      expect(plugin).toBeInstanceOf(WalletPlugin);
    });
  });

  describe('createWallet', () => {
    it('should create wallet', async () => {
      expect.assertions(2);
      const payload = { data: 'data' };

      context.ask = jest.fn().mockResolvedValueOnce({
        status: true,
        payload,
      });

      const res = await plugin.generateWallet();

      expect(res).toEqual(payload);
      expect(context.ask)
        .toBeCalledWith(MESSENGER_METHODS.GENERATE_WALLET);
    });

    it('should throw error for create wallet', async () => {
      expect.assertions(2);

      context.ask = jest.fn().mockResolvedValueOnce({
        status: false,
      });

      try {
        await plugin.generateWallet();
      } catch (e) {
        expect(e).toEqual(new Error('Wallet creation error'));
      }

      expect(context.ask)
        .toBeCalledWith(MESSENGER_METHODS.GENERATE_WALLET);
    });
  });
});

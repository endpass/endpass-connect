import ConnectPlugin from '@/plugins/ConnectPlugin';
import ProviderComponent from '@/plugins/ProviderPlugin';
import InpageProvider from '@/plugins/ProviderPlugin/InpageProvider';
import PluginApiTrait from '@/class/PluginApiTrait';

describe('Connect class', () => {
  let connect;
  const authUrl = 'http://test.auth';
  const oauthClientId = 'xxxxxxxxxx';
  const plugins = [ProviderComponent];
  beforeAll(() => {
    window.open = jest.fn();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    connect = new ConnectPlugin({ authUrl, oauthClientId, plugins });
  });

  describe('initial', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create instance of connect if all authUrl present', () => {
      connect = new ConnectPlugin({ authUrl, oauthClientId });
      expect(connect).toBeInstanceOf(PluginApiTrait);
    });

    it('should create instance of connect if all authUrl present', () => {
      connect = new ConnectPlugin({ authUrl, oauthClientId, plugins });
      expect(connect).toBeInstanceOf(PluginApiTrait);
    });
  });

  describe('getProvider', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      connect = new ConnectPlugin({ authUrl, oauthClientId, plugins });
    });

    it('should return Inpage provider from given parameters', async () => {
      expect.assertions(1);

      const res = await connect.getProvider();

      expect(res instanceof InpageProvider).toBe(true);
    });
  });
});

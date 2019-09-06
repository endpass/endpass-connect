import ConnectPlugin from '@/plugins/Connect';
import ProviderComponent from '@/plugins/ProviderPlugin';
import InpageProvider from '@/plugins/ProviderPlugin/InpageProvider';

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
      expect(connect).toBeInstanceOf(ConnectPlugin);
    });

    it('should create instance of connect if all authUrl present', () => {
      connect = new ConnectPlugin({ authUrl, oauthClientId, plugins });
      expect(connect).toBeInstanceOf(ConnectPlugin);
    });
  });

  describe('getProvider', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      connect = new ConnectPlugin({ authUrl, oauthClientId, plugins });
    });

    it('should return Inpage provider from given parameters', () => {
      const res = connect.getProvider();

      expect(res instanceof InpageProvider).toBe(true);
    });
  });
});

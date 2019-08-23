import Connect from '@/Connect';
import ProviderPlugin from '@/plugins/ProviderPlugin';
import InpageProvider from '@/class/InpageProvider';

describe('Connect class', () => {
  let connect;
  const authUrl = 'http://test.auth';
  const oauthClientId = 'xxxxxxxxxx';
  const plugins = [ProviderPlugin];
  beforeAll(() => {
    window.open = jest.fn();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    connect = new Connect({ authUrl, oauthClientId, plugins });
  });

  describe('initial', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create instance of connect if all authUrl present', () => {
      connect = new Connect({ authUrl, oauthClientId });
      expect(connect).toBeInstanceOf(Connect);
    });

    it('should create instance of connect if all authUrl present', () => {
      connect = new Connect({ authUrl, oauthClientId, plugins });
      expect(connect).toBeInstanceOf(Connect);
    });
  });

  describe('getProvider', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      connect = new Connect({ authUrl, oauthClientId, plugins });
    });

    it('should return Inpage provider from given parameters', () => {
      const res = connect.getProvider();

      expect(res instanceof InpageProvider).toBe(true);
    });
  });
});

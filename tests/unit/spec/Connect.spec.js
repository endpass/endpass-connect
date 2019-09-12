import ConnectError from '@endpass/class/ConnectError';
import ConnectPlugin from '@/plugins/ConnectPlugin';
import ProviderPlugin from '@/plugins/ProviderPlugin';
import OauthPlugin from '@/plugins/OauthPlugin';
import InpageProvider from '@/plugins/ProviderPlugin/InpageProvider';
import PluginApiTrait from '@/class/PluginApiTrait';

const { ERRORS } = ConnectError;

describe('Connect class', () => {
  let connect;
  const authUrl = 'http://test.auth';
  const oauthClientId = 'xxxxxxxxxx';
  const plugins = [ProviderPlugin, OauthPlugin];
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

    it('should throw error if not passed oauth id', () => {
      try {
        connect = new ConnectPlugin({ authUrl, plugins });
      } catch (e) {
        const err = new Error('Connect library requires OAuth client id!');

        expect(e).toEqual(err);
        expect(e.code).toBe(ERRORS.OAUTH_REQUIRE_ID)
      }
    });

    it('should create empty connect', () => {
      connect = new ConnectPlugin();
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

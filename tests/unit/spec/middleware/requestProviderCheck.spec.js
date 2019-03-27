import requestProviderCheck from '@/middleware/requestProviderCheck';
import Network from '@endpass/class/Network';

describe('requestProviderCheck middleware', () => {
  const mainUrl = Network.NETWORK_URL_HTTP[Network.NET_ID.MAIN][0];
  const getRequestProvider = jest.fn().mockReturnValue({ host: mainUrl });
  const context = {
    getRequestProvider,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should stop processing the request with an invalid net id', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const item = {
      settings: { activeNet: 0 },
      end: jest.fn(),
    };

    requestProviderCheck(context, item);

    expect(item.end).toBeCalled();

    consoleSpy.mockRestore();
  });

  it(`should chain request with a valid net id`, () => {
    const item = Object.freeze({
      settings: Object.freeze({ activeNet: String(Network.NET_ID.MAIN) }),
    });
    const cachedItem = { ...item };

    const freezeContext = Object.freeze({ getRequestProvider });

    requestProviderCheck(freezeContext, item);

    expect(item).toEqual(cachedItem);
  });
});

import requestProviderCheck from '@/middleware/requestProviderCheck';
import { NETWORK_URL, NET_ID } from '@/constants';

describe('requestProviderCheck middleware', () => {
  const mainUrl = NETWORK_URL.ETH[0];
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
      settings: Object.freeze({ activeNet: NET_ID.MAIN }),
    });
    const cachedItem = { ...item };

    const freezeContext = Object.freeze({ getRequestProvider });

    requestProviderCheck(freezeContext, item);

    expect(item).toEqual(cachedItem);
  });
});

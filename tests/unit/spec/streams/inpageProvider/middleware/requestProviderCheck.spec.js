import Network from '@endpass/class/Network';
import requestProviderCheck from '@/streams/inpageProvider/middleware/requestProviderCheck';

describe('requestProviderCheck middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should stop processing the request with an invalid net id', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const action = {
      settings: { activeNet: 0 },
      end: jest.fn(),
    };

    requestProviderCheck({ action });

    expect(action.end).toBeCalled();

    consoleSpy.mockRestore();
  });

  it(`should chain request with a valid net id`, () => {
    const action = Object.freeze({
      settings: Object.freeze({ activeNet: String(Network.NET_ID.MAIN) }),
    });
    const cachedItem = { ...action };

    requestProviderCheck({ action});

    expect(action).toEqual(cachedItem);
  });
});

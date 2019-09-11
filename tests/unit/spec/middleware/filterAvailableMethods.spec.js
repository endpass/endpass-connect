import { INPAGE_EVENTS, DAPP_BLACKLISTED_METHODS } from '@/constants';
import filterAvailableMethods from '@/streams/inpageProvider/middleware/filterAvailableMethods';

describe('filterAvailableMethods middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should stop processing the request with unavailable methods', () => {
    DAPP_BLACKLISTED_METHODS.map(method => ({
      request: {
        method,
      },
      end: jest.fn(),
    })).forEach(action => {
      const providerPlugin = {
        emitter: {
          emit: jest.fn(),
        },
      };

      filterAvailableMethods({ providerPlugin, action });
      expect(action.end).toBeCalledTimes(1);
    });
  });

  it('should send error to provider with unavailable methods', () => {
    DAPP_BLACKLISTED_METHODS.map(method => ({
      request: {
        method,
      },
      end: jest.fn(),
    })).forEach(action => {
      const emit = jest.fn();
      const providerPlugin = {
        emitter: {
          emit,
        },
      };

      filterAvailableMethods({ action, providerPlugin });

      expect(emit).toBeCalledTimes(1);
      expect(emit).toBeCalledWith(
        INPAGE_EVENTS.RESPONSE,
        expect.objectContaining({
          error: {
            code: expect.any(Number),
            message: expect.any(String),
          },
        }),
      );
    });
  });

  it('should chain request with available methods', async () => {
    const action = {
      request: {
        method: 'not_in_black_list',
      },
      end: jest.fn(),
    };

    await filterAvailableMethods({ action });

    expect(action.end).not.toBeCalled();
  });
});

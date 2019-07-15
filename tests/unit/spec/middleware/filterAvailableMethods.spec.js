import { INPAGE_EVENTS, DAPP_BLACKLISTED_METHODS } from '@/constants';
import filterAvailableMethods from '@/middleware/filterAvailableMethods';

describe('filterAvailableMethods middleware', () => {
  const context = {
    getEmitter: () => ({
      emit: jest.fn(),
    }),
  };

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
      filterAvailableMethods(context, action);

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
      const contextWithMock = {
        getEmitter: () => ({
          emit,
        }),
      };

      filterAvailableMethods(contextWithMock, action);

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

  it('should chain request with available methods', () => {
    const action = {
      request: {
        method: 'not_in_black_list',
      },
      end: jest.fn(),
    };

    filterAvailableMethods(context, action);

    expect(action.end).not.toBeCalled();
  });
});

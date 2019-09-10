import ConnectError from '@endpass/class/ConnectError';
import { AuthorizePlugin } from '@/plugins/AuthorizePlugin';
import { MESSENGER_METHODS } from '@/constants';

const { ERRORS } = ConnectError;

describe('AuthorizePluginPlugin class', () => {
  let authInstance;
  const context = {
    ask: jest.fn(),
  };

  const options = {};

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    authInstance = new AuthorizePlugin(options, context);
  });

  it('should auth user through context request and returns result', async () => {
    expect.assertions(4);

    expect(authInstance.isLogin).toBe(false);

    const contextResponse = {
      status: true,
      payload: {
        type: 'local',
        serverUrl: undefined,
      },
    };

    context.ask.mockResolvedValueOnce(contextResponse);

    const res = await authInstance.authorizeMe();

    expect(context.ask).toBeCalledWith(MESSENGER_METHODS.AUTH, {
      redirectUrl: 'http://localhost/',
    });
    expect(res).toEqual(contextResponse);
    expect(authInstance.isLogin).toBe(true);
  });

  it('should throw error if auth status is falsy', async () => {
    expect.assertions(3);

    context.ask.mockResolvedValueOnce({
      status: false,
      code: ERRORS.AUTH,
    });

    try {
      await authInstance.authorizeMe();
    } catch (e) {
      const err = new Error('Authentication Error!');
      expect(e).toEqual(err);
      expect(e.code).toBe(ERRORS.AUTH);
    }
    expect(authInstance.isLogin).toBe(false);
  });

  it('should logout user through context request and returns result', async () => {
    expect.assertions(2);

    const contextResponse = {
      status: true,
      payload: {
        type: 'local',
        serverUrl: undefined,
      },
    };

    context.ask.mockResolvedValueOnce(contextResponse);

    const res = await authInstance.logout();

    expect(context.ask).toBeCalledWith(MESSENGER_METHODS.LOGOUT);
    expect(res).toEqual(contextResponse.status);
  });

  it('should throw error if logout user wrong', async () => {
    expect.assertions(2);

    const contextResponse = {
      status: false,
      code: ERRORS.AUTH_LOGOUT,
    };

    context.ask.mockResolvedValueOnce(contextResponse);

    try {
      await authInstance.authorizeMe();
    } catch (e) {
      const err = new Error('Logout Error!');
      expect(e).toEqual(err);
      expect(e.code).toBe(ERRORS.AUTH_LOGOUT);
    }
  });

  describe('initial data', () => {
    const demoData = {};

    it('should pass isLogin with demoData', () => {
      const defaultAuth = new AuthorizePlugin(options, context);

      const demoAuth = new AuthorizePlugin({ demoData }, context);

      expect(defaultAuth.isLogin).toBe(false);
      expect(demoAuth.isLogin).toBe(true);
    });
  });
});

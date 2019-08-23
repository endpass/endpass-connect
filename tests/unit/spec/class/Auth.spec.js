import ConnectError from '@endpass/class/ConnectError';
import Auth from '@/class/Auth';
import { METHODS } from '@/constants';

const { ERRORS } = ConnectError;

describe('Auth class', () => {
  let authInstance;
  const dialog = {
    ask: jest.fn(),
  };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    authInstance = new Auth({
      dialog,
    });
  });

  it('should auth user through dialog request and returns result', async () => {
    expect.assertions(4);

    expect(authInstance.isLogin).toBe(false);

    const dialogResponse = {
      status: true,
      payload: {
        type: 'local',
        serverUrl: undefined,
      },
    };

    dialog.ask.mockResolvedValueOnce(dialogResponse);

    const res = await authInstance.auth();

    expect(dialog.ask).toBeCalledWith(METHODS.AUTH, {
      redirectUrl: 'http://localhost/',
    });
    expect(res).toEqual(dialogResponse);
    expect(authInstance.isLogin).toBe(true);
  });

  it('should throw error if auth status is falsy', async () => {
    expect.assertions(3);

    dialog.ask.mockResolvedValueOnce({
      status: false,
      code: ERRORS.AUTH,
    });

    try {
      await authInstance.auth();
    } catch (e) {
      const err = new Error('Authentication Error!');
      expect(e).toEqual(err);
      expect(e.code).toBe(ERRORS.AUTH);
    }
    expect(authInstance.isLogin).toBe(false);
  });

  it('should logout user through dialog request and returns result', async () => {
    expect.assertions(2);

    const dialogResponse = {
      status: true,
      payload: {
        type: 'local',
        serverUrl: undefined,
      },
    };

    dialog.ask.mockResolvedValueOnce(dialogResponse);

    const res = await authInstance.logout();

    expect(dialog.ask).toBeCalledWith(METHODS.LOGOUT);
    expect(res).toEqual(dialogResponse.status);
  });

  it('should throw error if logout user wrong', async () => {
    expect.assertions(2);

    const dialogResponse = {
      status: false,
      code: ERRORS.AUTH_LOGOUT,
    };

    dialog.ask.mockResolvedValueOnce(dialogResponse);

    try {
      await authInstance.auth();
    } catch (e) {
      const err = new Error('Logout Error!');
      expect(e).toEqual(err);
      expect(e.code).toBe(ERRORS.AUTH_LOGOUT);
    }
  });

  describe('initial data', () => {
    const demoData = {};

    it('should pass isLogin with demoData', () => {
      const defaultAuth = new Auth({
        dialog,
      });

      const demoAuth = new Auth({
        dialog,
        options: { demoData },
      });

      expect(defaultAuth.isLogin).toBe(false);
      expect(demoAuth.isLogin).toBe(true);
    });
  });
});

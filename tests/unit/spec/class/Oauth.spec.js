import Oauth, { STORE_KEYS } from '@/class/Oauth';
import PopupWindow from '@/class/PopupWindow';

jest.mock('@/class/PopupWindow', () => {
  return {
    open: jest.fn(),
  };
});

describe('Oauth class', () => {
  let oauth;
  const scopes = ['chpok'];
  const clientId = 'kek';
  const token = 'bam';

  const response = {
    client_id: clientId,
    scope: scopes.join(','),
    response_type: 'token',
  };

  function popupOpenImplement(options = {}) {
    PopupWindow.open.mockImplementation(params => {
      return {
        state: params.state,
        expires_in: 3600,
        access_token: token,
        ...options,
      };
    });
  }
  beforeEach(() => {
    jest.clearAllMocks();
    oauth = new Oauth({
      scopes,
      clientId,
    });
  });

  describe('constructor', () => {
    it('should use existing token if not expired', async () => {
      expect.assertions(4);

      // prepare old token
      const oldToken = 'oldToken';
      popupOpenImplement({
        access_token: oldToken,
      });

      await oauth.authorize();

      expect(oauth.getStoredValue(STORE_KEYS.TOKEN)).toBe(oldToken);

      const newToken = await oauth.getToken();

      expect(newToken).toBe(oldToken);

      // next get token
      oauth = new Oauth({
        scopes,
        clientId,
      });

      const secondToken = await oauth.getToken();

      expect(PopupWindow.open).toBeCalledTimes(1);
      expect(secondToken).toBe(oldToken);
    });

    it('should get new token if old is expired', async () => {
      expect.assertions(3);

      popupOpenImplement({
        expires_in: -3600,
      });

      await oauth.authorize();

      expect(oauth.getStoredValue(STORE_KEYS.TOKEN)).toBe(token);

      const newToken = 'newToken';
      popupOpenImplement({
        access_token: newToken,
      });

      const secondToken = await oauth.getToken();

      expect(secondToken).toBe(newToken);
      expect(PopupWindow.open).toBeCalledTimes(2);
    });
  });

  describe('logout', () => {
    it('should clear scope, token, expires in instance and local storage', async () => {
      expect.assertions(3);

      popupOpenImplement();
      await oauth.authorize();

      oauth.logout();

      expect(oauth.getStoredValue(STORE_KEYS.SCOPE)).toBe(null);
      expect(oauth.getStoredValue(STORE_KEYS.TOKEN)).toBe(null);
      expect(oauth.getStoredValue(STORE_KEYS.EXPIRES)).toBe(null);
    });
  });

  describe('getToken', () => {
    beforeEach(() => {
      oauth.authorize = jest.fn();
    });

    it('should try to authorize if token is not present', async () => {
      expect.assertions(1);

      await oauth.getToken();

      expect(oauth.authorize).toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should call method with correct params and set token', async () => {
      expect.assertions(3);

      const checkToken = 'checkToken';
      popupOpenImplement({
        access_token: checkToken,
      });

      await oauth.authorize();

      const newToken = await oauth.getToken();

      expect(newToken).toBe(checkToken);
      expect(PopupWindow.open).toHaveBeenCalledWith(
        expect.objectContaining(response),
        { height: 1000, width: 600 },
      );
      expect(PopupWindow.open).toBeCalledTimes(1);
    });

    it('should set token, and expire time and save it to local storage', async () => {
      expect.assertions(4);

      PopupWindow.open.mockImplementation(params => {
        return {
          state: params.state,
          expires_in: 3600,
          access_token: token,
        };
      });
      await oauth.authorize();

      const expiresValue = oauth.getStoredValue(STORE_KEYS.EXPIRES);

      expect(oauth.getStoredValue(STORE_KEYS.TOKEN)).toBe(token);
      expect(expiresValue).toMatch(/[0-9]{13}/);
      expect(expiresValue - 0).toBeGreaterThanOrEqual(new Date().getTime());
      expect(expiresValue - 0).toBeLessThanOrEqual(
        new Date().getTime() + 3600 * 1000,
      );
    });
  });

  describe('setPopupParams', () => {
    it('should use default params', async () => {
      expect.assertions(1);

      popupOpenImplement();
      await oauth.authorize();

      expect(PopupWindow.open).toHaveBeenCalledWith(
        expect.objectContaining(response),
        { height: 1000, width: 600 },
      );
    });

    it('should set popup params', async () => {
      expect.assertions(1);

      oauth.setPopupParams({
        width: 'abc',
        height: 10,
      });

      popupOpenImplement();
      await oauth.authorize();

      expect(PopupWindow.open).toHaveBeenCalledWith(
        expect.objectContaining(response),
        { height: 10, width: 600 },
      );
    });
  });
});

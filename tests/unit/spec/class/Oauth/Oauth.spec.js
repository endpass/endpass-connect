import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Oauth, { OauthPkceStrategy } from '@/class/Oauth';
import PopupWindow from '@/class/PopupWindow';

jest.mock('@/class/PopupWindow', () => {
  return {
    open: jest.fn(),
  };
});

jest.mock('@/class/Oauth/pkce', () => {
  return {
    generateRandomString: jest.fn().mockReturnValue('pkce-random-string'),
    challengeFromVerifier: jest
      .fn()
      .mockImplementation(random => `verifier -> ${random}`),
  };
});

describe('Oauth class', () => {
  let axiosMock;

  let oauth;
  const scopes = ['chpok'];
  const clientId = 'kek';
  const token = 'bam';
  const oauthServer = 'https://identity-dev.endpass.com/api/v1.1/oauth';

  const response = {
    client_id: 'kek',
    code_challenge: 'verifier -> pkce-random-string',
    code_challenge_method: 'S256',
    response_type: 'code',
    scope: scopes.join(' '),
    state: 'pkce-random-string',
  };

  PopupWindow.open.mockImplementation((serverUrl, params) => {
    return {
      state: params.state,
      expires_in: 3600,
      access_token: token,
      ...params,
    };
  });

  function mockOauthTokenResult(result = {}, status = 200) {
    axiosMock.onPost(`${oauthServer}/token`).reply(() => {
      return [status, result];
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock = new MockAdapter(axios);
    oauth = new Oauth({
      scopes,
      clientId,
      strategy: OauthPkceStrategy,
    });
  });

  describe('constructor', () => {
    it('should use existing token if not expired', async () => {
      expect.assertions(4);

      // prepare old token
      const oldToken = 'oldToken';
      mockOauthTokenResult({
        expires_in: 3600,
        access_token: oldToken,
      });

      await oauth.updateTokenObject();

      expect(oauth.getTokenObjectFromStore().token).toBe(oldToken);

      const newToken = await oauth.getToken();

      expect(newToken).toBe(oldToken);

      // next get token
      oauth = new Oauth({
        scopes,
        clientId,
        strategy: OauthPkceStrategy,
      });

      const secondToken = await oauth.getToken();

      expect(PopupWindow.open).toBeCalledTimes(1);
      expect(secondToken).toBe(oldToken);
    });

    it('should get new token if old is expired', async () => {
      expect.assertions(3);

      mockOauthTokenResult({
        expires_in: -3600,
        access_token: token,
      });

      await oauth.updateTokenObject();

      expect(oauth.getTokenObjectFromStore().token).toBe(token);

      const newToken = 'newToken';
      mockOauthTokenResult({
        access_token: newToken,
      });

      const secondToken = await oauth.getToken();

      expect(secondToken).toBe(newToken);
      expect(PopupWindow.open).toBeCalledTimes(2);
    });
  });

  describe('logout', () => {
    it('should clear scope, token, expires in instance and local storage', async () => {
      expect.assertions(4);

      mockOauthTokenResult({
        access_token: token,
        expires_in: 3600,
      });
      await oauth.updateTokenObject();

      expect(oauth.getTokenObjectFromStore().scope).toBe('chpok');
      expect(oauth.getTokenObjectFromStore().token).toBe(token);
      expect(oauth.getTokenObjectFromStore().expires).toBeGreaterThanOrEqual(
        new Date().getTime(),
      );

      oauth.logout();

      expect(oauth.getTokenObjectFromStore()).toBe(null);
    });
  });

  describe('getToken', () => {
    beforeEach(() => {
      oauth.updateTokenObject = jest.fn().mockResolvedValue(token);
    });

    it('should try to update tokenObject if token is not present', async () => {
      expect.assertions(1);

      await oauth.getToken();

      expect(oauth.updateTokenObject).toHaveBeenCalled();
    });
  });

  describe('updateTokenObject', () => {
    it('should call method with correct params and set token', async () => {
      expect.assertions(3);

      const checkToken = 'checkToken';
      mockOauthTokenResult({
        access_token: checkToken,
        expires_in: 3600,
      });

      await oauth.updateTokenObject();

      const newToken = await oauth.getToken();

      expect(newToken).toBe(checkToken);
      expect(PopupWindow.open).toHaveBeenCalledWith(oauthServer, response, {
        height: 1000,
        width: 600,
      });
      expect(PopupWindow.open).toBeCalledTimes(1);
    });

    it('should set token, and expire time and save it to local storage', async () => {
      expect.assertions(4);

      mockOauthTokenResult({
        expires_in: 3600,
        access_token: token,
      });
      await oauth.updateTokenObject();

      const expiresValue = oauth.getTokenObjectFromStore().expires;

      expect(oauth.getTokenObjectFromStore().token).toBe(token);
      expect(expiresValue.toString()).toMatch(/[0-9]{13}/);
      expect(expiresValue - 0).toBeGreaterThanOrEqual(new Date().getTime());
      expect(expiresValue - 0).toBeLessThanOrEqual(
        new Date().getTime() + 3600 * 1000,
      );
    });

    it('should drop token, if update error', async () => {
      expect.assertions(3);

      mockOauthTokenResult({
        expires_in: -3600,
        access_token: token,
      });
      await oauth.updateTokenObject();

      expect(oauth.getTokenObjectFromStore()).not.toBe(null);
      expect(oauth.getTokenObjectFromStore().token).toBe(token);

      mockOauthTokenResult({}, 404);
      try {
        await oauth.getToken();
      } catch (e) {}

      expect(oauth.getTokenObjectFromStore()).toBe(null);
    });
  });

  describe('setPopupParams', () => {
    it('should use default params', async () => {
      expect.assertions(1);

      mockOauthTokenResult({
        expires_in: 3600,
        access_token: token,
      });

      await oauth.updateTokenObject();

      expect(PopupWindow.open).toHaveBeenCalledWith(
        oauthServer,
        expect.objectContaining(response),
        { height: 1000, width: 600 },
      );
    });

    it('should set popup params', async () => {
      expect.assertions(1);

      mockOauthTokenResult({
        expires_in: 3600,
        access_token: token,
      });

      oauth.setPopupParams({
        width: 'abc',
        height: 10,
      });

      await oauth.updateTokenObject();

      expect(PopupWindow.open).toHaveBeenCalledWith(
        oauthServer,
        expect.objectContaining(response),
        { height: 10, width: 600 },
      );
    });
  });
});

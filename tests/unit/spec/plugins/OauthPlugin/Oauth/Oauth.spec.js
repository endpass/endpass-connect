import MockAdapter from 'axios-mock-adapter';
import Oauth, { OauthPkceStrategy } from '@/plugins/OauthPlugin/Oauth';
import FrameStrategy from '@/plugins/OauthPlugin/FrameStrategy';
import Polling from '@/plugins/OauthPlugin/Oauth/Polling';

jest.mock('@/plugins/OauthPlugin/FrameStrategy/IframeFrame');

jest.mock('@/plugins/OauthPlugin/Oauth/Polling', () => {
  class PollingMock {}

  PollingMock.prototype.open = jest.fn().mockResolvedValue();
  PollingMock.prototype.getResult = jest
    .fn()
    .mockResolvedValue({ state: 'pkce-random-string' });
  return PollingMock;
});

jest.mock('@/plugins/OauthPlugin/Oauth/pkce', () => ({
  generateRandomString: jest.fn().mockReturnValue('pkce-random-string'),
  challengeFromVerifier: jest
    .fn()
    .mockImplementation(random => `verifier -> ${random}`),
}));

describe('Oauth class', () => {
  let context;
  let oauth;
  let mockAdapter;
  const scopes = ['chpok'];
  const clientId = 'kek';
  const token = 'bam';
  const oauthServer = 'http://oauthServer/oauth';

  function mockOauthTokenResult(result = {}, status = true) {
    context.ask.mockResolvedValue({
      payload: result,
      status,
    });
  }

  const createOauth = () => {
    context = {
      ask: jest.fn(),
    };

    const oauthStrategy = new OauthPkceStrategy({ context });
    const frameStrategy = new FrameStrategy({ oauthPopup: false });

    const res = new Oauth({
      clientId,
      scopes,
      oauthServer,
      oauthStrategy,
      frameStrategy,
    });
    mockAdapter = new MockAdapter(res.axiosInstance);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    oauth = createOauth();
  });

  const createSpyResult = () => jest.spyOn(Polling.prototype, 'getResult');

  describe('constructor', () => {
    it('should use existing token if not expired', async () => {
      expect.assertions(4);

      const spy = createSpyResult();
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
      oauth = createOauth();

      const secondToken = await oauth.getToken();

      expect(secondToken).toBe(oldToken);
      expect(spy).toBeCalledTimes(1);
    });

    it('should get new token if old is expired', async () => {
      expect.assertions(3);

      const spy = createSpyResult();
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
      expect(spy).toBeCalledTimes(2);
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

      oauth.dropToken();

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

      mockOauthTokenResult(null, false);
      try {
        await oauth.getToken();
      } catch (e) {}

      expect(oauth.getTokenObjectFromStore()).toBe(null);
    });
  });

  describe('request', () => {
    const url = 'url';
    const secondUrl = 'secondUrl';
    const hash = 'hash';

    const requestData = {
      data: 'data',
    };

    beforeEach(() => {
      mockOauthTokenResult({
        expires_in: 3600,
        access_token: token,
      });
      mockAdapter.onGet(url).reply(200, requestData);
      mockAdapter.onGet(secondUrl).reply(200, requestData);
    });

    afterEach(() => {
      oauth.dropToken();
    });

    it('should pass request with ask permissions', async () => {
      expect.assertions(2);

      const spy = createSpyResult();
      const { data } = await oauth.request({
        url,
      });

      await oauth.request({
        url,
      });

      expect(data).toEqual(requestData);
      expect(spy).toBeCalledTimes(1);
    });

    it('should pass request with changed scopes and ask permissions', async () => {
      expect.assertions(2);

      const spy = createSpyResult();
      const otherScopes = ['kek', 'chop'];

      await oauth.request({
        url,
      });

      const { data } = await oauth.request({
        scopes: otherScopes,
        url: secondUrl,
      });

      await oauth.request({
        scopes: otherScopes,
        url,
      });

      expect(data).toEqual(requestData);
      expect(spy).toBeCalledTimes(2);
    });

    it('should set token when request makes', async () => {
      expect.assertions(2);

      expect(oauth.getTokenObjectFromStore()).toBe(null);

      await oauth.request({
        url,
      });

      expect(oauth.getTokenObjectFromStore().token).toBe(token);
    });

    describe('changeAuthStatus', () => {
      it('should define token and not drop if code 200', async () => {
        expect.assertions(2);

        expect(oauth.getTokenObjectFromStore()).toBe(null);

        oauth.changeAuthStatus({ code: 200 });
        await oauth.request({
          url,
        });

        expect(oauth.getTokenObjectFromStore().token).toBe(token);
      });

      it('should drop token if auth status received 401 code', async () => {
        expect.assertions(2);

        oauth.changeAuthStatus({ code: 200, hash });
        await oauth.request({
          url,
        });
        expect(oauth.getTokenObjectFromStore().token).toBe(token);

        oauth.changeAuthStatus({ code: 401 });

        expect(oauth.getTokenObjectFromStore()).toBe(null);
      });

      it('should not drop token if auth status received 403 code', async () => {
        expect.assertions(2);

        oauth.changeAuthStatus({ code: 200, hash });
        await oauth.request({
          url,
        });
        expect(oauth.getTokenObjectFromStore().token).toBe(token);

        oauth.changeAuthStatus({ code: 403, hash });

        expect(oauth.getTokenObjectFromStore().token).toBe(token);
      });

      it('should not drop token if auth status received 200 code', async () => {
        expect.assertions(2);

        oauth.changeAuthStatus({ code: 200, hash });
        await oauth.request({
          url,
        });

        expect(oauth.getTokenObjectFromStore().token).toBe(token);

        oauth.changeAuthStatus({ code: 200, hash });

        expect(oauth.getTokenObjectFromStore().token).toBe(token);
      });

      it('should drop token if auth status received 200 code but hash is changed', async () => {
        expect.assertions(2);

        oauth.changeAuthStatus({ code: 200, hash });
        await oauth.request({
          url,
        });

        expect(oauth.getTokenObjectFromStore().token).toBe(token);

        oauth.changeAuthStatus({ code: 200, hash: 'other hash' });

        expect(oauth.getTokenObjectFromStore()).toBe(null);
      });
    });
  });
});

import Oauth from '@/class/Oauth';
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
  beforeEach(() => {
    oauth = new Oauth({
      scopes,
      clientId
    })
  })

  describe('constructor', () => {
    it('should get token and expire time from local storage', async () => {
      expect.assertions(2);

      const oldToken = 'tram';
      const expires = new Date().getTime() + 10000000;
      localStorage.setItem(`${clientId}scope`, scopes.join(' '));
      localStorage.setItem(`${clientId}token`, oldToken);
      localStorage.setItem(`${clientId}expires`, expires);
      oauth = new Oauth({
        scopes,
        clientId
      });

      expect(oauth.token).toBe(oldToken);
      expect(oauth.expires).toBe(expires);
    });

    it('shouldn\'t set localStorage token if it\'s expired', async () => {
      expect.assertions(2);

      const oldToken = 'tram';
      const expires = new Date().getTime() - 10000000;
      localStorage.setItem(`${clientId}scope`, scopes.join(' '));
      localStorage.setItem(`${clientId}token`, oldToken);
      localStorage.setItem(`${clientId}expires`, expires);
      oauth = new Oauth({
        scopes,
        clientId
      });

      expect(oauth.token).toBe(null);
      expect(oauth.expires).toBe(null);
    });
  });

  describe('logout', () => {
    it('should clear scope, token, expires it instance and local storage', () => {
      const expires = new Date().getTime() + 10000000;
      localStorage.setItem(`${clientId}scope`, scopes.join(' '));
      localStorage.setItem(`${clientId}token`, token);
      localStorage.setItem(`${clientId}expires`, expires);
      oauth = new Oauth({
        scopes,
        clientId
      });

      oauth.logout();

      expect(localStorage.getItem(`${clientId}scope`)).toBe(null);
      expect(localStorage.getItem(`${clientId}token`)).toBe(null);
      expect(localStorage.getItem(`${clientId}expires`)).toBe(null);
      expect(oauth.scope).toBe(null);
      expect(oauth.token).toBe(null);
      expect(oauth.expires).toBe(null);
    });
  })

  describe('getToken', () => {
    beforeEach(()=>{
      oauth.authorize = jest.fn()
    })

    it('should use existing token if present', async () => {
      expect.assertions(2);

      oauth.token = token
      const recievedToken = await oauth.getToken();

      expect(oauth.authorize).not.toHaveBeenCalled();
      expect(recievedToken).toBe(token);
    })
    it('should try to authorize if token is not present', async () => {
      expect.assertions(1);

      await oauth.getToken();

      expect(oauth.authorize).toHaveBeenCalled();
    })
  })

  describe('authorize', () => {
    it('should call method with coorect params and set token', async () => {
     expect.assertions(1);
     PopupWindow.open.mockImplementation((params) => {
       return {
         state: params.state,
         expires_in: 3600,
         access_token: token
       }
     });
     await oauth.authorize();
     expect(PopupWindow.open).toHaveBeenCalledWith(
       expect.objectContaining({
         client_id: 'kek',
         scope: 'chpok',
         response_type: 'token',
       }),
       { height: 1000, width: 600 }
     );
   });

   it('should set token, and expire time and save it to local storage', async () => {
      expect.assertions(5);
      PopupWindow.open.mockImplementation((params) => {
        return {
          state: params.state,
          expires_in: 3600,
          access_token: token
        }
      });
      await oauth.authorize();

      expect(localStorage.getItem(`${clientId}token`)).toBe(token);
      expect(localStorage.getItem(`${clientId}expires`)).toMatch(/[0-9]{13}/);
      expect(oauth.token).toBe(token);
      expect(oauth.expires).toBeGreaterThanOrEqual(new Date().getTime());
      expect(oauth.expires).toBeLessThanOrEqual(new Date().getTime() + (3600 * 1000));
    });
  })
})

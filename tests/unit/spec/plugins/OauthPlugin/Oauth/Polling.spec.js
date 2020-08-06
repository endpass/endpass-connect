import Polling from '@/plugins/OauthPlugin/Oauth/Polling';

describe('Polling', () => {
  let target = {};
  const url = 'http://foo.bar';
  const frame = {
    open: jest.fn().mockResolvedValue(),
    close: jest.fn(),
  };

  Object.defineProperty(frame, 'target', {
    get() {
      return target;
    },
  });

  function prepareLocation(params) {
    target.location = {
      ...target.location,
      ...params,
    };
    const poll = new Polling(frame);

    const res = poll.getResult(url);
    jest.advanceTimersByTime(1000);

    return res;
  }

  beforeEach(() => {
    jest.useFakeTimers();
    target = {
      location: {
        href: '',
        pathname: '',
        origin: 'http://foo.bar',
        port: '',
        hash: '',
        search: '',
      },
      closed: false,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('poll popup', () => {
    it('should return poll from hash', async () => {
      expect.assertions(1);

      const res = await prepareLocation({
        hash: '#/code=10',
      });

      expect(res).toEqual({
        code: '10',
      });
    });

    it('should return poll from search', async () => {
      expect.assertions(1);

      const res = await prepareLocation({
        search: '?code=20',
      });

      expect(res).toEqual({
        code: '20',
      });
    });

    it('should return poll from search with hash', async () => {
      expect.assertions(1);

      const res = await prepareLocation({
        hash: '#/',
        search: '?code=30',
      });

      expect(res).toEqual({
        code: '30',
      });
    });

    it('should return poll from hash with search', async () => {
      expect.assertions(1);

      const res = await prepareLocation({
        hash: '#/code=40',
        search: '?',
      });

      expect(res).toEqual({
        code: '40',
      });
    });

    it('should return poll result only for code', async () => {
      expect.assertions(1);

      const res = await prepareLocation({
        hash: '#/q=100&code=40',
        search: '?',
      });

      expect(res).toEqual({
        code: '40',
      });
    });

    it('should return poll result', async () => {
      expect.assertions(1);

      const handler = jest.fn();

      const res = prepareLocation({
        hash: '#/code=100',
        search: '?',
      });

      res.then(handler);

      await global.flushPromises();

      expect(handler).toBeCalled();
    });

    it('should not return poll result', async () => {
      expect.assertions(1);

      const handler = jest.fn();

      const res = prepareLocation({
        hash: '#/q=100',
        search: '?',
      });

      res.then(handler);

      await global.flushPromises();

      expect(handler).not.toBeCalled();
    });
  });
});

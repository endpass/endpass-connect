import Polling from '@/plugins/OauthPlugin/Oauth/Polling';

describe('Polling', () => {
  let target = {};
  const url = 'url';
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

    const res = poll.result(url);
    jest.advanceTimersByTime(1000);

    return res;
  }

  beforeEach(() => {
    jest.useFakeTimers();
    target = {
      location: {
        href: '',
        pathname: '',
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
        hash: '#/q=10',
      });

      expect(res).toEqual({
        q: '10',
      });
    });

    it('should return poll from search', async () => {
      expect.assertions(1);

      const res = await prepareLocation({
        search: '?q=20',
      });

      expect(res).toEqual({
        q: '20',
      });
    });

    it('should return poll from search with hash', async () => {
      expect.assertions(1);

      const res = await prepareLocation({
        hash: '#/',
        search: '?q=30',
      });

      expect(res).toEqual({
        q: '30',
      });
    });

    it('should return poll from hash with search', async () => {
      expect.assertions(1);

      const res = await prepareLocation({
        hash: '#/q=40',
        search: '?',
      });

      expect(res).toEqual({
        q: '40',
      });
    });
  });
});

import PopupWindow from '@/class/PopupWindow';

describe('Popup window', () => {
  let returnWindow;
  let popupPromise;

  function prepareLocation(params) {
    returnWindow.location = {
      ...returnWindow.location,
      ...params,
    };
    jest.advanceTimersByTime(1000);

    return popupPromise;
  }

  beforeEach(() => {
    jest.useFakeTimers();
    returnWindow = {
      location: {
        href: '',
        pathname: '',
        hash: '',
        search: '',
      },
      closed: false,
    };
    window.open = jest.fn().mockReturnValue(returnWindow);
    popupPromise = PopupWindow.open('testServer');
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

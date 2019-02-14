import Connect, { privateMethods } from '@/lib';

describe('Connect class – instance', () => {
  beforeAll(() => {
    window.open = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('instance', () => {
    it('should create instance of connect if all appUrl present', () => {
      const connect = new Connect({ authUrl: 'http://localhost:5000' });

      expect(connect).toBeInstanceOf(Connect);
    });

    it('should subscribe on events is subscribe property passed to constructor', () => {
      jest.spyOn(Connect.prototype, privateMethods.setupEmmiterEvents);
      jest.spyOn(
        Connect.prototype,
        privateMethods.subscribeOnRequestsQueueChanges,
      );
      jest.spyOn(Connect.prototype, privateMethods.initBridge);

      const connect = new Connect({
        authUrl: 'http://localhost:5000',
      });

      expect(connect[privateMethods.setupEmmiterEvents]).toBeCalled();
      expect(
        connect[privateMethods.subscribeOnRequestsQueueChanges],
      ).toBeCalled();
      expect(connect[privateMethods.initBridge]).toBeCalled();
    });

    it('should be created without authUrl parameter', () => {
      const connect = new Connect();

      expect(connect.authUrl).not.toBe(undefined);
    });
  });
});

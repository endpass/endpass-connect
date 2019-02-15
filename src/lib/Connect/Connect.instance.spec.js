import Connect from '@/lib/Connect';
import PrivateMethods from '@/lib/PrivateMethods';
import privateFields from '@/lib/privateFields';

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
      jest.spyOn(PrivateMethods.prototype, 'setupEmmiterEvents');
      jest.spyOn(PrivateMethods.prototype, 'subscribeOnRequestsQueueChanges');
      jest.spyOn(PrivateMethods.prototype, 'initBridge');

      const connect = new Connect({
        authUrl: 'http://localhost:5000',
      });

      const privateMethods = connect[privateFields.methods];

      expect(privateMethods.setupEmmiterEvents).toBeCalled();
      expect(privateMethods.subscribeOnRequestsQueueChanges).toBeCalled();
      expect(privateMethods.initBridge).toBeCalled();
    });

    it('should be created without authUrl parameter', () => {
      const connect = new Connect();
      const context = connect[privateFields.context];
      expect(context.authUrl).not.toBe(undefined);
    });
  });
});

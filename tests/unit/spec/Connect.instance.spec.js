import Web3HttpProvider from 'web3-providers-http';
import Connect from '@/Connect';
import Context from '@/Context';
import Providers from '@/Providers';
import Queue from '@/Queue';
import privateFields from '@/privateFields';

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
      jest.spyOn(Queue.prototype, 'setupEmitterEvents');
      jest.spyOn(Context.prototype, 'initBridge');
      jest.spyOn(Providers.prototype, 'createRequestProvider');

      const connect = new Connect({
        authUrl: 'http://localhost:5000',
      });

      const queue = connect[privateFields.queue];
      const context = connect[privateFields.context];
      const providers = connect[privateFields.providers];

      expect(queue.setupEmitterEvents).toBeCalled();
      expect(context.initBridge).toBeCalled();
      expect(providers.createRequestProvider).toBeCalledWith(Web3HttpProvider);
    });

    it('should be created without authUrl parameter', () => {
      const connect = new Connect();
      const context = connect[privateFields.context];
      expect(context.authUrl).not.toBe(undefined);
    });
  });
});

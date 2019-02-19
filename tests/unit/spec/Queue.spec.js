import Connect from '@/Connect';
import Queue from '@/Queue';
import { INPAGE_EVENTS } from '@/constants';
import privateFields from '@/privateFields';

describe('Connect class – private methods', () => {
  let connect;
  let context;
  let queue;
  const middleWareMock = jest.fn();
  const middleware = [middleWareMock];

  function jestTimeout(ms = 3000) {
    return new Promise(resolve => {
      resolve();
      jest.advanceTimersByTime(ms);
    });
  }

  beforeAll(() => {
    window.open = jest.fn();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    connect = new Connect({ appUrl: 'http://localhost:5000' });
    context = connect[privateFields.context];
    jest.clearAllTimers();

    queue = new Queue(context, middleware);
  });

  describe('ticks call', () => {
    it('should call next tick', () => {
      expect(queue.queueTimeout).toBe(null);

      queue.handleRequest({ id: 'test' });

      expect(queue.queueTimeout).not.toBe(null);
    });

    it('should process current request if queue is not empty', async () => {
      expect.assertions(2);

      queue = new Queue(context, { middleware });
      queue.handleRequest({
        id: 'block',
        foo: 'bar',
      });

      jest.runAllTimers();
      await jestTimeout();

      expect(queue.queue.length).toBe(0);
      expect(middleWareMock).toBeCalledTimes(1);
    });

    it('should pass only first element in queue', async () => {
      expect.assertions(3);

      const mock = jest.fn();
      queue = new Queue(context, {
        middleware: [
          (ctx, item) => {
            mock(item.request);
          },
        ],
      });
      const firstItem = {
        id: 'first',
      };
      queue.handleRequest(firstItem);
      queue.handleRequest({
        id: 'second',
      });

      expect(queue.queue.length).toBe(2);

      jest.runAllTimers();
      await jestTimeout();
      expect(mock).toBeCalledWith(firstItem);
      expect(queue.queue.length).toBe(1);
    });

    it('should not do anything if queue is empty', async () => {
      expect.assertions(1);

      const mock = jest.fn();
      queue = new Queue(context, {
        middleware: [
          (ctx, item) => {
            mock(item.request);
          },
        ],
      });

      jest.runAllTimers();
      await jestTimeout();

      expect(mock).not.toBeCalled();
    });
  });

  describe('setupEventEmitter', () => {
    it('should subscribe on emitter events', () => {
      context.emitter = {
        on: jest.fn(),
      };
      queue.setupEventEmitter();

      expect(context.emitter.on).toBeCalledTimes(2);
      expect(context.emitter.on).toHaveBeenNthCalledWith(
        1,
        INPAGE_EVENTS.REQUEST,
        expect.any(Function),
      );
      expect(context.emitter.on).toHaveBeenNthCalledWith(
        2,
        INPAGE_EVENTS.SETTINGS,
        expect.any(Function),
      );
    });
  });
});

import Queue from '@/Queue';
import { INPAGE_EVENTS } from '@/constants';

describe('Queue class', () => {
  let emitter;
  let context;
  let queue;
  const middleWareMock = jest.fn();
  const middleware = [middleWareMock];

  beforeAll(() => {
    window.open = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    emitter = {
      on: jest.fn(),
    };
    context = {
      emitter,
      getEmitter: jest.fn().mockReturnValue(emitter),
      getInpageProviderSettings: jest.fn(),
    };

    queue = new Queue(context, { middleware });
  });

  describe('constructor', () => {
    it('should subscribe on emitter events', () => {
      expect(context.emitter.on).toBeCalledTimes(2);
      expect(context.emitter.on).toHaveBeenNthCalledWith(
        1,
        INPAGE_EVENTS.REQUEST,
        queue.handleRequest,
      );
      expect(context.emitter.on).toHaveBeenNthCalledWith(
        2,
        INPAGE_EVENTS.SETTINGS,
        queue.handleRequest,
      );
    });
  });

  describe('handleRequest', () => {
    it('should process requests using middleware', async () => {
      expect.assertions(3);

      const firstItem = {
        id: 'first',
      };
      const secondItem = {
        id: 'second',
      };
      queue.handleRequest(firstItem);
      queue.handleRequest(secondItem);

      await global.flushPromises();

      expect(middleWareMock).toBeCalledTimes(2);
      expect(middleWareMock).toHaveBeenNthCalledWith(
        1,
        context,
        expect.objectContaining({
          request: firstItem,
        }),
      );
      expect(middleWareMock).toHaveBeenNthCalledWith(
        2,
        context,
        expect.objectContaining({
          request: secondItem,
        }),
      );
    });

    it('should not do anything if queue is empty', async () => {
      expect.assertions(1);

      await global.flushPromises();

      expect(middleWareMock).not.toBeCalled();
    });
  });
});

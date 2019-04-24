import { INPAGE_EVENTS } from '@/constants';
import { Emmiter } from '@/class';

jest.mock('@/streams/inpageProvider/middleware', () => {
  // eslint-disable-next-line
  const middleWare1 = jest.fn().mockResolvedValue('test1');
  const middle2 = jest.fn().mockResolvedValue('test2');
  const res = [middleWare1, middle2];
  return res;
});

describe('inpageProviderStream', () => {
  let emitter;
  let context;
  let middleWareMock;
  let middleware;
  let inpageProviderStream;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    inpageProviderStream = require('@/streams/inpageProvider/inpageProviderStream')
      .default;
    middleware = require('@/streams/inpageProvider/middleware');
    [middleWareMock] = middleware;
    emitter = new Emmiter();

    context = {
      getEmitter: () => emitter,
      getInpageProviderSettings: jest.fn(),
    };

    inpageProviderStream(context);
  });

  describe('initial', () => {
    it('should not call data after init', () => {
      emitter = {
        on: jest.fn(),
        off: jest.fn(),
      };

      inpageProviderStream({
        getEmitter: () => emitter,
        getInpageProviderSettings: jest.fn(),
      });

      expect(middleWareMock).not.toBeCalled();

      expect(emitter.on).toHaveBeenNthCalledWith(
        1,
        INPAGE_EVENTS.REQUEST,
        expect.any(Function),
      );

      expect(emitter.on).toHaveBeenNthCalledWith(
        2,
        INPAGE_EVENTS.SETTINGS,
        expect.any(Function),
      );

      expect(middleWareMock).not.toBeCalled();
    });
  });

  describe('stopActions', () => {
    it('should process all middleware', async () => {
      expect.assertions(2);

      const firstItem = {
        id: 'first',
      };
      emitter.emit(INPAGE_EVENTS.REQUEST, firstItem);

      await global.flushPromises();

      expect(middleware[0]).toBeCalledTimes(1);
      expect(middleware[1]).toBeCalledTimes(1);
    });

    it('should not process next middleware', async () => {
      expect.assertions(2);

      middleware[0] = jest.fn().mockImplementation((ctx, action) => {
        return new Promise(resolve => {
          action.end();
          return resolve();
        });
      });

      const firstItem = {
        id: 'first',
      };
      emitter.emit(INPAGE_EVENTS.REQUEST, firstItem);

      await global.flushPromises();

      expect(middleware[0]).toBeCalledTimes(1);
      expect(middleware[1]).toBeCalledTimes(0);
    });
  });

  describe('emitRequest', () => {
    it('should process requests using middleware', async () => {
      expect.assertions(3);

      const firstItem = {
        id: 'first',
      };
      const secondItem = {
        id: 'second',
      };

      emitter.emit(INPAGE_EVENTS.REQUEST, firstItem);
      emitter.emit(INPAGE_EVENTS.REQUEST, secondItem);

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

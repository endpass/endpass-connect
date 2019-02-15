import Connect from '@/lib/Connect';
import Bridge from '@/class/Bridge';
import Dialog from '@/class/Dialog';
import { INPAGE_EVENTS, METHODS } from '@/constants';
import privateFields from '@/lib/privateFields';

describe('Connect class – private methods', () => {
  let connect;
  let privateMethods;
  let context;

  beforeAll(() => {
    window.open = jest.fn();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    connect = new Connect({ appUrl: 'http://localhost:5000' });
    // eslint-disable-next-line
    privateMethods = connect[privateFields.methods];
    // eslint-disable-next-line
    context = connect[privateFields.context];
  });

  describe('subscribeOnRequestsQueueChanges', () => {
    beforeEach(() => {
      privateMethods.processCurrentRequest = jest.fn();
    });

    it('should set queue interval', () => {
      privateMethods.subscribeOnRequestsQueueChanges();

      expect(privateMethods.queueInterval).not.toBeNull();
    });

    it('should process current request if queue is not empty', () => {
      const queue = [
        {
          foo: 'bar',
        },
      ];

      privateMethods.subscribeOnRequestsQueueChanges();
      privateMethods.queue = [...queue];

      jest.advanceTimersByTime(3000);

      expect(context.currentRequest).toEqual(queue[0]);
      expect(privateMethods.queue).toHaveLength(0);
      expect(privateMethods.processCurrentRequest).toBeCalledTimes(1);
    });

    it('should not do anything if current request is not empty', () => {
      context.currentRequest = {
        foo: 'bar',
      };

      privateMethods.subscribeOnRequestsQueueChanges();

      jest.advanceTimersByTime(3000);

      expect(privateMethods.processCurrentRequest).not.toBeCalled();
    });

    it('should not do anything if queue is empty', () => {
      privateMethods.queue = [];

      privateMethods.subscribeOnRequestsQueueChanges();

      jest.advanceTimersByTime(3000);

      expect(privateMethods.processCurrentRequest).not.toBeCalled();
    });
  });

  describe('processCurrentRequest', () => {
    beforeEach(() => {
      privateMethods.sendResponse = jest.fn();
    });

    it('should process current request with sign if request in whitelist and send response', async () => {
      expect.assertions(3);

      const request = {
        method: 'personal_sign',
      };

      context.currentRequest = { ...request };
      privateMethods.sign = jest.fn(() => ({
        ...request,
        signed: true,
      }));

      await privateMethods.processCurrentRequest();

      expect(privateMethods.sign).toBeCalled();
      expect(privateMethods.sendResponse).toBeCalledWith({
        ...request,
        signed: true,
      });
      expect(context.currentRequest).toBe(null);
    });

    it('should send current request to network and send response', async () => {
      expect.assertions(3);

      const request = {
        method: 'eth_some',
      };

      context.currentRequest = { ...request };
      privateMethods.sendToNetwork = jest.fn(() => ({
        ...request,
        signed: true,
      }));

      await privateMethods.processCurrentRequest();

      expect(privateMethods.sendToNetwork).toBeCalled();
      expect(privateMethods.sendResponse).toBeCalledWith({
        ...request,
        signed: true,
      });
      expect(context.currentRequest).toBe(null);
    });

    it('should handle errors and send response with empty result and error', async () => {
      expect.assertions(3);

      const request = {
        method: 'eth_some',
      };
      const error = new Error('foo');

      context.currentRequest = { ...request };
      privateMethods.sendToNetwork = jest.fn().mockRejectedValue(error);

      await privateMethods.processCurrentRequest();

      expect(privateMethods.sendToNetwork).toBeCalled();
      expect(privateMethods.sendResponse).toBeCalledWith({
        ...request,
        result: null,
        error,
      });
      expect(context.currentRequest).toBe(null);
    });
  });

  describe('processWhitelistedRequest', () => {
    beforeEach(() => {
      privateMethods.sign = jest.fn();
      privateMethods.recover = jest.fn();
    });

    it('should call recover private method if request method is personal_ecRecover', () => {
      const request = {
        method: 'personal_ecRecover',
      };

      context.currentRequest = request;
      privateMethods.processWhitelistedRequest();

      expect(privateMethods.recover).toBeCalled();
      expect(privateMethods.sign).not.toBeCalled();
    });

    it('should call sign private method in other cases', () => {
      const request = {
        method: 'personal_sign',
      };

      context.currentRequest = request;
      privateMethods.processWhitelistedRequest();

      expect(privateMethods.recover).not.toBeCalled();
      expect(privateMethods.sign).toBeCalled();
    });
  });

  describe('getConnectUrl', () => {
    it('should return url to auth on connect application', () => {
      expect(context.getConnectUrl('foo')).toBe('https://auth.endpass.com/foo');
    });
  });

  describe('setupEmmiterEvents', () => {
    it('should subscribe on emitter events', () => {
      context.emitter = {
        on: jest.fn(),
      };
      privateMethods.setupEmmiterEvents();

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

  describe('sendResponse', () => {
    it('should send response via emitter', () => {
      const payload = {
        foo: 'bar',
      };

      context.emitter.emit = jest.fn();
      privateMethods.sendResponse(payload);

      expect(context.emitter.emit).toBeCalledWith(
        INPAGE_EVENTS.RESPONSE,
        payload,
      );
    });
  });

  describe('handleRequest', () => {
    it('should push reuest to queue if it contains id', () => {
      privateMethods.handleRequest({
        id: 1,
      });

      expect(privateMethods.queue).toHaveLength(1);
    });

    it('should not push reuest to queue if it not contains id', () => {
      privateMethods.handleRequest({
        foo: 'bar',
      });

      expect(privateMethods.queue).toHaveLength(0);
    });
  });

  describe('createRequestProvider', () => {
    it('should create and set request provider with given web3 instance', () => {
      const httpProvider = {
        foo: 'bar',
      };
      const web3 = {
        providers: {
          HttpProvider: jest.fn(() => httpProvider),
        },
      };
      const settings = {
        activeNet: 1,
      };

      privateMethods.getSettings = jest.fn(() => settings);
      privateMethods.createRequestProvider(web3.providers.HttpProvider);

      expect(context.requestProvider).toEqual(httpProvider);
      expect(web3.providers.HttpProvider).toBeCalledWith(expect.any(String));
    });
  });

  // TODO: find right way to implement this test suite
  //     describe('sendToNetwork', () => {
  //       it('should send request to network with connect request provider', async () => {
  //         expect.assertions(2);
  //
  //         const request = {
  //           jsonrpc: '2.0',
  //           method: 'foo',
  //           params: [],
  //         };
  //         const requestProvider = {
  //           sendAsync: jest.fn().mockImplementation(
  //             (req,
  //             cb => {
  //               return ;
  //             }),
  //           ),
  //         };
  //
  //         connect.requestProvider = requestProvider;
  //         connect.currentRequest = request;
  //
  //         const res = await privateMethods.sendToNetwork();
  //
  //         expect(requestProvider.sendAsync).toBeCalledWith(
  //           request,
  //           expect.any(Function),
  //         );
  //         expect(res).toBe(true);
  //       });
  //     });

  describe('initBridge', () => {
    it('should create new bridge and save link to it in connect instance', () => {
      jest.spyOn(Bridge.prototype, 'mount');

      context.bridge = null;
      privateMethods.initBridge();

      expect(context.bridge).not.toBe(null);
      expect(context.bridge.mount).toBeCalled();
    });
  });

  describe('getUserSettings', () => {
    let bridge;

    beforeEach(() => {
      bridge = {
        ask: jest.fn(),
      };
      context.bridge = bridge;
    });

    it('should request user settings through inner connect bridge', async () => {
      expect.assertions(2);

      const response = {
        status: true,
      };
      context.bridge.ask.mockResolvedValueOnce(response);

      const res = await privateMethods.getUserSettings();

      expect(context.bridge.ask).toBeCalledWith({
        method: METHODS.GET_SETTINGS,
      });
      expect(res).toBe(response);
    });

    it('should throw error is request status is falsy', () => {
      bridge.ask.mockResolvedValueOnce({
        status: false,
      });

      expect(privateMethods.getUserSettings()).rejects.toThrow();
    });
  });

  describe('recover', () => {
    const request = {
      jsonrpc: '2.0',
      method: 'foo',
      params: [],
    };
    let bridge;

    beforeEach(() => {
      bridge = {
        ask: jest.fn(),
      };
      privateMethods.getSettings = jest.fn(() => ({
        activeAccount: '0x0',
        activeNet: 1,
      }));
      context.bridge = bridge;
      context.currentRequest = request;
    });

    it('should recover request through bridge messaging', async () => {
      expect.assertions(1);

      context.bridge.ask.mockResolvedValueOnce({
        status: true,
        result: 'hello',
      });

      await privateMethods.recover();

      expect(context.bridge.ask).toBeCalledWith({
        method: METHODS.RECOVER,
        address: '0x0',
        net: 1,
        request,
      });
    });

    it('should throw error is request status is falsy', () => {
      bridge.ask.mockResolvedValueOnce({
        status: false,
      });

      expect(privateMethods.recover()).rejects.toThrow();
    });
  });

  describe('sign', () => {
    const request = {
      jsonrpc: '2.0',
      method: 'foo',
      params: [],
    };
    let dialog;

    beforeEach(() => {
      dialog = {
        ask: jest.fn().mockResolvedValueOnce({
          status: true,
        }),
        close: jest.fn(),
      };
      privateMethods.openApp = jest.fn().mockResolvedValueOnce();
      privateMethods.getSettings = jest.fn(() => ({
        activeAccount: '0x0',
        activeNet: 1,
      }));
      context.currentRequest = request;
      context.dialog = dialog;
    });

    it('should requests account data, open sign dialog, await sign message and send message to dialog', async () => {
      expect.assertions(2);

      await privateMethods.sign();

      expect(dialog.ask).toBeCalledWith({
        address: '0x0',
        net: 1,
        method: METHODS.SIGN,
        url: expect.any(String),
        request,
      });
      expect(dialog.close).toBeCalled();
    });

    it('should throw error is request status is falsy', async () => {
      expect.assertions(1);

      dialog.ask = jest.fn().mockResolvedValueOnce({
        status: false,
      });

      const err = new Error('Sign error!');
      let check;
      try {
        await privateMethods.sign();
      } catch (e) {
        check = e;
      }

      expect(check).toEqual(err);
    });
  });

  describe('openApp', () => {
    beforeEach(() => {
      Dialog.prototype.open = jest.fn().mockResolvedValueOnce();
    });

    it('should open modal', async () => {
      expect.assertions(1);

      await privateMethods.openApp('auth');

      expect(context.dialog.open).toBeCalled();
    });
  });
});

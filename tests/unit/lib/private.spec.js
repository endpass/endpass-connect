import Connect, { privateMethods } from '@/lib';
import Bridge from '@/class/Bridge';
import Dialog from '@/class/Dialog';
import { INPAGE_EVENTS, METHODS } from '@/constants';

describe('Connect class – private methods', () => {
  let connect;

  beforeAll(() => {
    window.open = jest.fn();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    connect = new Connect({ appUrl: 'http://localhost:5000' });
  });

  describe('subscribeOnRequestsQueueChanges', () => {
    beforeEach(() => {
      connect[privateMethods.processCurrentRequest] = jest.fn();
    });

    it('should set queue interval', () => {
      connect[privateMethods.subscribeOnRequestsQueueChanges]();

      expect(connect.queueInterval).not.toBeNull();
    });

    it('should process current request if queue is not empty', () => {
      const queue = [
        {
          foo: 'bar',
        },
      ];

      connect[privateMethods.subscribeOnRequestsQueueChanges]();
      connect.queue = [...queue];

      jest.advanceTimersByTime(3000);

      expect(connect.currentRequest).toEqual(queue[0]);
      expect(connect.queue).toHaveLength(0);
      expect(connect[privateMethods.processCurrentRequest]).toBeCalledTimes(1);
    });

    it('should not do anything if current request is not empty', () => {
      connect.currentRequest = {
        foo: 'bar',
      };

      connect[privateMethods.subscribeOnRequestsQueueChanges]();

      jest.advanceTimersByTime(3000);

      expect(connect[privateMethods.processCurrentRequest]).not.toBeCalled();
    });

    it('should not do anything if queue is empty', () => {
      connect.queue = [];

      connect[privateMethods.subscribeOnRequestsQueueChanges]();

      jest.advanceTimersByTime(3000);

      expect(connect[privateMethods.processCurrentRequest]).not.toBeCalled();
    });
  });

  describe('processCurrentRequest', () => {
    beforeEach(() => {
      connect[privateMethods.sendResponse] = jest.fn();
    });

    it('should process current request with sign if request in whitelist and send response', async () => {
      expect.assertions(3);

      const request = {
        method: 'personal_sign',
      };

      connect.currentRequest = { ...request };
      connect[privateMethods.sign] = jest.fn(() => ({
        ...request,
        signed: true,
      }));

      await connect[privateMethods.processCurrentRequest]();

      expect(connect[privateMethods.sign]).toBeCalled();
      expect(connect[privateMethods.sendResponse]).toBeCalledWith({
        ...request,
        signed: true,
      });
      expect(connect.currentRequest).toBe(null);
    });

    it('should send current request to network and send response', async () => {
      expect.assertions(3);

      const request = {
        method: 'eth_some',
      };

      connect.currentRequest = { ...request };
      connect[privateMethods.sendToNetwork] = jest.fn(() => ({
        ...request,
        signed: true,
      }));

      await connect[privateMethods.processCurrentRequest]();

      expect(connect[privateMethods.sendToNetwork]).toBeCalled();
      expect(connect[privateMethods.sendResponse]).toBeCalledWith({
        ...request,
        signed: true,
      });
      expect(connect.currentRequest).toBe(null);
    });

    it('should handle errors and send response with empty result and error', async () => {
      expect.assertions(3);

      const request = {
        method: 'eth_some',
      };
      const error = new Error('foo');

      connect.currentRequest = { ...request };
      connect[privateMethods.sendToNetwork] = jest
        .fn()
        .mockRejectedValue(error);

      await connect[privateMethods.processCurrentRequest]();

      expect(connect[privateMethods.sendToNetwork]).toBeCalled();
      expect(connect[privateMethods.sendResponse]).toBeCalledWith({
        ...request,
        result: null,
        error,
      });
      expect(connect.currentRequest).toBe(null);
    });
  });

  describe('processWhitelistedRequest', () => {
    beforeEach(() => {
      connect[privateMethods.sign] = jest.fn();
      connect[privateMethods.recover] = jest.fn();
    });

    it('should call recover private method if request method is personal_ecRecover', () => {
      const request = {
        method: 'personal_ecRecover',
      };

      connect.currentRequest = request;
      connect[privateMethods.processWhitelistedRequest]();

      expect(connect[privateMethods.recover]).toBeCalled();
      expect(connect[privateMethods.sign]).not.toBeCalled();
    });

    it('should call sign private method in other cases', () => {
      const request = {
        method: 'personal_sign',
      };

      connect.currentRequest = request;
      connect[privateMethods.processWhitelistedRequest]();

      expect(connect[privateMethods.recover]).not.toBeCalled();
      expect(connect[privateMethods.sign]).toBeCalled();
    });
  });

  describe('getConnectUrl', () => {
    it('should return url to auth on connect application', () => {
      expect(connect[privateMethods.getConnectUrl]('foo')).toBe(
        'https://auth.endpass.com/#/foo',
      );
    });
  });

  describe('setupEmmiterEvents', () => {
    it('should subscribe on emmiter events', () => {
      connect.emmiter = {
        on: jest.fn(),
      };
      connect[privateMethods.setupEmmiterEvents]();

      expect(connect.emmiter.on).toBeCalledTimes(2);
      expect(connect.emmiter.on).toHaveBeenNthCalledWith(
        1,
        INPAGE_EVENTS.REQUEST,
        expect.any(Function),
      );
      expect(connect.emmiter.on).toHaveBeenNthCalledWith(
        2,
        INPAGE_EVENTS.SETTINGS,
        expect.any(Function),
      );
    });
  });

  describe('sendResponse', () => {
    it('should send response via emmiter', () => {
      const payload = {
        foo: 'bar',
      };

      connect.emmiter.emit = jest.fn();
      connect[privateMethods.sendResponse](payload);

      expect(connect.emmiter.emit).toBeCalledWith(
        INPAGE_EVENTS.RESPONSE,
        payload,
      );
    });
  });

  describe('handleRequest', () => {
    it('should push reuest to queue if it contains id', () => {
      connect[privateMethods.handleRequest]({
        id: 1,
      });

      expect(connect.queue).toHaveLength(1);
    });

    it('should not push reuest to queue if it not contains id', () => {
      connect[privateMethods.handleRequest]({
        foo: 'bar',
      });

      expect(connect.queue).toHaveLength(0);
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
        networkVersion: 1,
      };

      connect[privateMethods.getSettings] = jest.fn(() => settings);
      connect[privateMethods.createRequestProvider](web3);

      expect(connect.requestProvider).toEqual(httpProvider);
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
  //         const res = await connect[privateMethods.sendToNetwork]();
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

      connect.bridge = null;
      connect[privateMethods.initBridge]();

      expect(connect.bridge).not.toBe(null);
      expect(connect.bridge.mount).toBeCalled();
    });
  });

  describe('getUserSettings', () => {
    let bridge;

    beforeEach(() => {
      bridge = {
        ask: jest.fn(),
      };
      connect.bridge = bridge;
    });

    it('should request user settings through inner connect bridge', async () => {
      expect.assertions(2);

      const response = {
        status: true,
      };
      connect.bridge.ask.mockResolvedValueOnce(response);

      const res = await connect[privateMethods.getUserSettings]();

      expect(connect.bridge.ask).toBeCalledWith({
        method: METHODS.GET_SETTINGS,
      });
      expect(res).toBe(response);
    });

    it('should throw error is request status is falsy', () => {
      bridge.ask.mockResolvedValueOnce({
        status: false,
      });

      expect(connect[privateMethods.getUserSettings]()).rejects.toThrow();
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
      connect[privateMethods.getSettings] = jest.fn(() => ({
        activeAccount: '0x0',
        activeNet: 1,
      }));
      connect.bridge = bridge;
      connect.currentRequest = request;
    });

    it('should recover request through bridge messaging', async () => {
      expect.assertions(1);

      connect.bridge.ask.mockResolvedValueOnce({
        status: true,
        result: 'hello',
      });

      await connect[privateMethods.recover]();

      expect(connect.bridge.ask).toBeCalledWith({
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

      expect(connect[privateMethods.recover]()).rejects.toThrow();
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
      connect[privateMethods.openApp] = jest.fn().mockResolvedValueOnce();
      connect[privateMethods.getSettings] = jest.fn(() => ({
        activeAccount: '0x0',
        activeNet: 1,
      }));
      connect.currentRequest = request;
      connect.dialog = dialog;
    });

    it('should requests account data, open sign dialog, await sign message and send message to dialog', async () => {
      await connect[privateMethods.sign]();

      expect(dialog.ask).toBeCalledWith({
        address: '0x0',
        net: 1,
        method: METHODS.SIGN,
        url: expect.any(String),
        request,
      });
      expect(dialog.close).toBeCalled();
    });

    it('should throw error is request status is falsy', () => {
      dialog.ask.mockResolvedValueOnce({
        status: false,
      });

      expect(connect[privateMethods.sign]()).rejects.toThrow();
    });
  });

  describe('openApp', () => {
    beforeEach(() => {
      Dialog.prototype.open = jest.fn().mockResolvedValueOnce();
    });

    it('should open modal', async () => {
      expect.assertions(1);

      await connect[privateMethods.openApp]('auth');

      expect(connect.dialog.open).toBeCalled();
    });
  });
});

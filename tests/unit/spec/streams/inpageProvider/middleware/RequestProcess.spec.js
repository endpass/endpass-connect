import ConnectError from '@/class/ConnectError';
import { INPAGE_EVENTS, MESSENGER_METHODS } from '@/constants';
import RequestProcess from '@/streams/inpageProvider/middleware/netRequest/RequestProcess';

const { ERRORS } = ConnectError;

describe('Request process middleware', () => {
  let reqProcess;
  let context;
  let providerPlugin;

  const emitter = {
    emit: jest.fn(),
  };

  beforeAll(() => {
    window.open = jest.fn();
    jest.useFakeTimers();
    providerPlugin = {
      emitter,
      getInpageProviderSettings: jest.fn(),
    };

    context = {
      ask: jest.fn(),
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    reqProcess = new RequestProcess({ context, providerPlugin });
  });

  describe('processRequest', () => {
    beforeEach(() => {
      reqProcess = new RequestProcess({ context, providerPlugin });
      reqProcess.sendResponse = jest.fn();
    });

    it('should process current request with sign if request in whitelist and send response', async () => {
      expect.assertions(2);

      const request = {
        method: 'personal_sign',
      };

      reqProcess.currentRequest = request;

      reqProcess.sign = jest.fn(() => ({
        ...request,
        signed: true,
      }));

      await reqProcess.start();

      expect(reqProcess.sign).toBeCalled();
      expect(reqProcess.sendResponse).toBeCalledWith({
        ...request,
        signed: true,
      });
    });

    it('should send current request to network and send response', async () => {
      expect.assertions(2);

      const request = {
        method: 'eth_some',
      };

      reqProcess.currentRequest = { ...request };
      reqProcess.sendToNetwork = jest.fn(() => ({
        ...request,
        signed: true,
      }));

      await reqProcess.start();

      expect(reqProcess.sendToNetwork).toBeCalled();
      expect(reqProcess.sendResponse).toBeCalledWith({
        ...request,
        signed: true,
      });
    });

    it('should handle errors and send response with empty result and error', async () => {
      expect.assertions(2);

      const request = {
        method: 'eth_some',
      };
      const error = new Error('foo');

      reqProcess.currentRequest = { ...request };
      reqProcess.sendToNetwork = jest.fn().mockRejectedValue(error);

      await reqProcess.start();

      expect(reqProcess.sendToNetwork).toBeCalled();
      expect(reqProcess.sendResponse).toBeCalledWith({
        ...request,
        result: null,
        error,
      });
    });
  });

  describe('processWhitelistedRequest', () => {
    beforeEach(() => {
      reqProcess.sign = jest.fn();
      reqProcess.recover = jest.fn();
    });

    it('should call recover private method if request method is personal_ecRecover', () => {
      const request = {
        method: 'personal_ecRecover',
      };

      reqProcess.currentRequest = request;
      reqProcess.processWhitelistedRequest();

      expect(reqProcess.recover).toBeCalled();
      expect(reqProcess.sign).not.toBeCalled();
    });

    it('should call sign private method in other cases', () => {
      const request = {
        method: 'personal_sign',
      };

      reqProcess.currentRequest = request;
      reqProcess.processWhitelistedRequest();

      expect(reqProcess.recover).not.toBeCalled();
      expect(reqProcess.sign).toBeCalled();
    });
  });

  describe('sendResponse', () => {
    it('should send response via emitter', () => {
      const payload = {
        foo: 'bar',
      };

      reqProcess.sendResponse(payload);

      expect(emitter.emit).toBeCalledWith(INPAGE_EVENTS.RESPONSE, payload);
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

  describe('recover', () => {
    const request = {
      jsonrpc: '2.0',
      method: 'foo',
      params: [],
    };

    beforeEach(() => {
      reqProcess.settings = {
        activeAccount: '0x0',
        activeNet: 1,
      };
      reqProcess.currentRequest = request;
    });

    it('should recover request through bridge messaging', async () => {
      expect.assertions(1);

      context.ask.mockResolvedValueOnce({
        status: true,
        result: 'hello',
      });

      await reqProcess.recover();

      expect(context.ask).toBeCalledWith(MESSENGER_METHODS.RECOVER, {
        address: '0x0',
        net: 1,
        request,
      });
    });

    it('should throw error is request recover status is falsy', () => {
      context.ask.mockResolvedValueOnce({
        status: false,
      });

      expect(reqProcess.recover()).rejects.toThrow();
    });
  });

  describe('sign', () => {
    const request = {
      jsonrpc: '2.0',
      method: 'foo',
      params: [],
    };

    beforeEach(() => {
      context.ask = jest.fn().mockResolvedValueOnce({
        status: true,
      });

      reqProcess.settings = {
        activeAccount: '0x0',
        activeNet: 1,
      };
      reqProcess.currentRequest = request;
    });

    it('should requests account data, open sign dialog, await sign message and send message to dialog', async () => {
      expect.assertions(1);

      await reqProcess.sign();

      expect(context.ask).toBeCalledWith(MESSENGER_METHODS.SIGN, {
        address: '0x0',
        net: 1,
        url: expect.any(String),
        request,
      });
    });

    it('should throw error is sign request status is falsy', async () => {
      expect.assertions(2);

      context.ask = jest.fn().mockResolvedValueOnce({
        status: false,
      });

      const err = new Error('Sign Error!');
      let check;
      try {
        await reqProcess.sign();
      } catch (e) {
        check = e;
      }

      expect(check).toEqual(err);
      expect(check.code).toEqual(ERRORS.SIGN);
    });
  });
});

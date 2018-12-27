import Wallet from '@@/class/Wallet';
import web3 from '@@/class/singleton/web3';
import { awaitMessageFromOpener, sendMessageToOpener } from '@@/util/message';
import requestsActions from '@@/app/src/store/modules/requests/actions';
import { METHODS } from '@@/constants';

describe('requests actions', () => {
  const password = 'secret';
  let dispatch;
  let commit;
  let state;

  beforeEach(() => {
    jest.clearAllMocks();

    state = {
      request: {
        address: '0x0',
        request: {
          id: 1,
          params: ['foo', 'bar'],
          jsonrpc: '2.0',
        },
      },
    };
    dispatch = jest.fn();
    commit = jest.fn();
  });

  describe('awaitRequestMessage', () => {
    it('should await request message and set request if it present', async () => {
      expect.assertions(1);

      const request = {
        foo: 'bar',
      };

      awaitMessageFromOpener.mockResolvedValueOnce(request);

      await requestsActions.awaitRequestMessage({ dispatch, commit });

      expect(commit).toBeCalledWith('setRequest', request);
    });

    it('should not set request if it not present', async () => {
      expect.assertions(1);

      awaitMessageFromOpener.mockResolvedValueOnce(null);

      await requestsActions.awaitRequestMessage({ dispatch, commit });

      expect(commit).not.toBeCalled();
    });

    it('should set web3 provider if message was received', async () => {
      awaitMessageFromOpener.mockResolvedValueOnce({
        net: 1,
      });

      await requestsActions.awaitRequestMessage({ dispatch, commit });

      expect(dispatch).toBeCalledWith('setWeb3NetworkProvider', 1);
    });

    it('should not set web3 provider if message was received', async () => {
      awaitMessageFromOpener.mockResolvedValueOnce(null);

      await requestsActions.awaitRequestMessage({ dispatch, commit });

      expect(dispatch).not.toBeCalled();
    });
  });

  describe('processRequest', () => {
    const account = {
      address: '0x0',
    };
    const signResult = '0x0123';

    it('should process request with new wallet instance and send response', async () => {
      expect.assertions(4);

      dispatch.mockResolvedValueOnce(account);
      dispatch.mockResolvedValueOnce(signResult);

      await requestsActions.processRequest(
        { state, commit, dispatch },
        password,
      );

      expect(dispatch).toBeCalledTimes(3);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        'getAccount',
        state.request.address,
      );
      expect(dispatch).toHaveBeenNthCalledWith(2, 'getSignedRequest', {
        wallet: expect.any(Wallet),
        password,
      });
      expect(dispatch).toHaveBeenNthCalledWith(3, 'sendResponse', {
        id: state.request.request.id,
        result: signResult,
        jsonrpc: state.request.request.jsonrpc,
      });
    });

    it('should send response with error if error was occured during processing request', async () => {
      expect.assertions(4);

      const error = new Error('foo');

      dispatch.mockResolvedValueOnce(account);
      dispatch.mockRejectedValueOnce(error);

      await requestsActions.processRequest(
        { state, commit, dispatch },
        password,
      );

      expect(dispatch).toBeCalledTimes(3);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        'getAccount',
        state.request.address,
      );
      expect(dispatch).toHaveBeenNthCalledWith(2, 'getSignedRequest', {
        wallet: expect.any(Wallet),
        password,
      });
      expect(dispatch).toHaveBeenNthCalledWith(3, 'sendResponse', {
        id: state.request.request.id,
        result: [],
        jsonrpc: state.request.request.jsonrpc,
        error,
      });
    });
  });

  describe('sendResponse', () => {
    const payload = {
      foo: 'bar',
    };

    it('should send response to opener and close dialog window', async () => {
      expect.assertions(2);

      await requestsActions.sendResponse({ dispatch }, payload);

      expect(sendMessageToOpener).toBeCalledWith('dialog', {
        ...payload,
        method: METHODS.SIGN,
        status: true,
      });
      expect(dispatch).toBeCalledWith('closeDialog');
    });
  });

  describe('getSignedRequest', () => {
    const payload = {
      foo: 'bar',
    };

    it('should return signed transaction if request method is eth_sendTransaction', async () => {
      expect.assertions(1);

      state.request.method = 'eth_sendTransaction';

      await requestsActions.getSignedRequest({ state, dispatch }, payload);

      expect(dispatch).toBeCalledWith('getSignedTransaction', payload);
    });

    it('should return signed typed data is getSignedTypedDataRequest', async () => {
      expect.assertions(1);

      state.request.method = 'eth_signTypedData';

      await requestsActions.getSignedRequest({ state, dispatch }, payload);

      expect(dispatch).toBeCalledWith('getSignedTypedDataRequest', payload);
    });

    it('should return signed request if reqest method is getSignedPlainRequest', async () => {
      expect.assertions(1);

      await requestsActions.getSignedRequest({ state, dispatch }, payload);

      expect(dispatch).toBeCalledWith('getSignedPlainRequest', payload);
    });
  });

  describe('getSignedTypedDataRequest', () => {
    it('should throw error', async done => {
      try {
        await requestsActions.getSignedTypedDataRequest();
      } catch (err) {
        done();
      }
    });
  });

  // TODO need to  rewrite logic or test
  //   describe('getSignedTransaction', () => {
  //     const tx = {
  //       foo: 'bar',
  //     };
  //     let sendEventMock;
  //
  //     beforeEach(() => {
  //       state.request.request.transaction = { ...tx };
  //       sendEventMock = {
  //         then: jest.fn(),
  //         on: jest.fn(),
  //         catch: jest.fn(),
  //       };
  //     });
  //
  //     it('should return signed by wallet transaction request', async () => {
  //       const walletMock = {
  //         getNextNonce: jest.fn().mockResolvedValueOnce(1),
  //         signTransaction: jest.fn().mockResolvedValueOnce(sendEventMock),
  //       };
  //
  //       await requestsActions.getSignedTransaction(
  //         { state },
  //         { password, wallet: walletMock },
  //       );
  //
  //       expect(walletMock.signTransaction).toBeCalledWith({
  //         ...tx,
  //         nonce: 1,
  //       });
  //     });
  //   });

  describe('getSignedPlainRequest', () => {
    it('should return signed by wallet plain request data', async () => {
      const walletMock = {
        sign: jest.fn().mockResolvedValueOnce({
          signature: '0x0',
        }),
      };

      const res = await requestsActions.getSignedPlainRequest(
        { state },
        { password, wallet: walletMock },
      );

      expect(walletMock.sign).toBeCalledWith(
        state.request.request.params[0],
        password,
      );
      expect(res).toBe('0x0');
    });
  });

  describe('cancelRequest', () => {
    it('should cancel current request', async () => {
      expect.assertions(1);

      await requestsActions.cancelRequest({ state, dispatch });

      expect(dispatch).toBeCalledWith('sendResponse', {
        id: state.request.request.id,
        result: [],
        error: 'canceled',
      });
    });
  });
});

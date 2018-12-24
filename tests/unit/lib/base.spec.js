import Connect from '@@/lib';
import { INPAGE_EVENTS, DIALOG_WINDOW_NAME } from '@@/constants';
import { awaitDialogMessage, sendMessageToDialog } from '@@/util/message';

describe('Connect class', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('instance', () => {
    it('should throw err if appUrl is not passed', () => {
      expect(() => {
        /* eslint-disable-next-line */
        new Connect();
      }).toThrow();
    });

    it('should create instance of connect if all appUrl present', () => {
      const connect = new Connect({ appUrl: 'http://localhost:5000' });

      expect(connect).toBeInstanceOf(Connect);
    });

    it('should subscribe on events is subscribe property passed to constructor', () => {
      jest.spyOn(Connect.prototype, 'setupEmmiterEvents');
      jest.spyOn(Connect.prototype, 'watchRequestsQueue');

      const connect = new Connect({
        appUrl: 'http://localhost:5000',
        subscribe: true,
      });

      expect(connect.setupEmmiterEvents).toBeCalled();
      expect(connect.watchRequestsQueue).toBeCalled();
    });
  });

  describe('methods', () => {
    let connect;

    beforeAll(() => {
      jest.useFakeTimers();
    });

    beforeEach(() => {
      connect = new Connect({ appUrl: 'http://localhost:5000' });
    });

    describe('watchRequestsQueue', () => {
      beforeEach(() => {
        connect.processCurrentRequest = jest.fn();
      });

      it('should set queue interval', () => {
        connect.watchRequestsQueue();

        expect(connect.queueInterval).not.toBeNull();
      });

      it('should process current request if queue is not empty', () => {
        const queue = [
          {
            foo: 'bar',
          },
        ];

        connect.watchRequestsQueue();
        connect.queue = [...queue];

        jest.advanceTimersByTime(3000);

        expect(connect.currentRequest).toEqual(queue[0]);
        expect(connect.queue).toHaveLength(0);
        expect(connect.processCurrentRequest).toBeCalledTimes(1);
      });

      it('should not do anything if current request is not empty', () => {
        connect.currentRequest = {
          foo: 'bar',
        };

        connect.watchRequestsQueue();

        jest.advanceTimersByTime(3000);

        expect(connect.processCurrentRequest).not.toBeCalled();
      });

      it('should not do anything if queue is empty', () => {
        connect.queue = [];

        connect.watchRequestsQueue();

        jest.advanceTimersByTime(3000);

        expect(connect.processCurrentRequest).not.toBeCalled();
      });
    });

    describe('unwatchRequestsQueue', () => {
      it('should unset queue interval', () => {
        const queue = [
          {
            foo: 'bar',
          },
        ];

        connect.queue = [...queue];
        connect.processCurrentRequest = jest.fn();
        connect.watchRequestsQueue();
        connect.unwatchRequestsQueue();

        jest.advanceTimersByTime(3000);

        expect(connect.processCurrentRequest).not.toBeCalled();
        expect(connect.queueInterval).toBe(null);
      });
    });

    describe('processCurrentRequest', () => {
      beforeEach(() => {
        connect.sendResponse = jest.fn();
      });

      it('should process current request with sign if request in whitelist and send response', async () => {
        expect.assertions(3);

        const request = {
          method: 'personal_sign',
        };

        connect.currentRequest = { ...request };
        connect.sign = jest.fn(() => ({
          ...request,
          signed: true,
        }));

        await connect.processCurrentRequest();

        expect(connect.sign).toBeCalled();
        expect(connect.sendResponse).toBeCalledWith({
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
        connect.sendToNetwork = jest.fn(() => ({
          ...request,
          signed: true,
        }));

        await connect.processCurrentRequest();

        expect(connect.sendToNetwork).toBeCalled();
        expect(connect.sendResponse).toBeCalledWith({
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
        connect.sendToNetwork = jest.fn().mockRejectedValue(error);

        await connect.processCurrentRequest();

        expect(connect.sendToNetwork).toBeCalled();
        expect(connect.sendResponse).toBeCalledWith({
          ...request,
          result: null,
          error,
        });
        expect(connect.currentRequest).toBe(null);
      });
    });

    describe('getConnectUrl', () => {
      it('should return url to auth on connect application', () => {
        expect(connect.getConnectUrl('foo')).toBe(
          'http://localhost:5000/#/foo',
        );
      });
    });

    describe('setupEmmiterEvents', () => {
      it('should subscribe on emmiter events', () => {
        connect.emmiter = {
          on: jest.fn(),
        };
        connect.setupEmmiterEvents();

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

    //     describe('getAccountData', () => {
    //       it('should request accounts by identity service', async () => {
    //         expect.assertions(1);
    //
    //         const accounts = ['0x0', '0x1'];
    //
    //         IdentityService.getAccounts.mockResolvedValueOnce(accounts);
    //         connect.getUserSettings = jest.fn().mockResolvedValueOnce({
    //           lastActiveAccount: '0x0',
    //         });
    //
    //         const res = await connect.getAccountData();
    //
    //         expect(res).toEqual({
    //           activeAccount: accounts[0],
    //           activeNet: 1,
    //         });
    //       });
    //
    //       it('should throw error', async done => {
    //         IdentityService.getAccounts.mockRejectedValueOnce();
    //
    //         try {
    //           await connect.getAccountData();
    //         } catch (err) {
    //           done();
    //         }
    //       });
    //     });

    describe('openApp', () => {
      it('should open app window', () => {
        window.innerWidth = 1000;
        window.open = jest.fn();

        connect.openApp('auth');

        expect(window.open).toBeCalledWith(
          'http://localhost:5000/#/auth',
          DIALOG_WINDOW_NAME,
          'chrome=yes,centerscreen=yes,resizable=no,width=480,height=800,top=200,left=300',
        );
      });
    });

    describe('auth', () => {
      it('should open auth dialog and await dialog message', () => {
        connect.openApp = jest.fn();

        connect.auth();

        expect(connect.openApp).toBeCalledWith('auth');
        expect(awaitDialogMessage).toBeCalled();
      });
    });

    describe('sign', () => {
      it('should requests account data, open sign dialog, await sign message and send message to dialog', async () => {
        // expect.assertions()

        const accountData = {
          activeAccount: '0x0',
          activeNet: 1,
        };
        const dialog = {
          foo: 'bar',
        };
        const request = {
          foo: 'bar',
        };
        const signedData = {
          data: {
            result: '0x0123',
          },
          source: 'http://localhost:5000',
        };

        connect.currentRequest = { ...request };
        connect.provider.settings.selectedAddress = accountData.activeAccount;
        connect.provider.settings.networkVersion = accountData.activeNet;
        connect.getAccountData = jest.fn().mockResolvedValueOnce(accountData);
        connect.openApp = jest.fn(() => dialog);
        awaitDialogMessage.mockResolvedValueOnce(signedData);

        const res = await connect.sign();

        expect(connect.openApp).toBeCalledWith('sign');
        expect(awaitDialogMessage).toBeCalledTimes(1);
        expect(sendMessageToDialog).toBeCalledWith({
          target: dialog,
          data: {
            url: 'http://localhost',
            address: accountData.activeAccount,
            net: accountData.activeNet,
            request,
          },
        });
        expect(res).toEqual(signedData.data);
      });
    });

    // TODO find way to correctly test this method
    //     describe('sendToNetwork', () => {
    //       it('should send current request to network with web3', async () => {
    //         const request = {
    //           foo: 'bar',
    //         };
    //
    //         connect.currentRequest = { ...request };
    //         web3.currentProvider = {
    //           sendAsync: jest.fn(),
    //         };
    //
    //         await connect.sendToNetwork();
    //
    //         expect(web3.currentProvider.sendAsync).toBeCalledWith(
    //           request,
    //           expect.any(Function),
    //         );
    //       });
    //     });

    describe('handleRequest', () => {
      it('should push reuest to queue if it contains id', () => {
        connect.handleRequest({
          id: 1,
        });

        expect(connect.queue).toHaveLength(1);
      });

      it('should not push reuest to queue if it not contains id', () => {
        connect.handleRequest({
          foo: 'bar',
        });

        expect(connect.queue).toHaveLength(0);
      });
    });

    describe('sendSettings', () => {
      it('should send given settings via emmiter', () => {
        const payload = {
          selectedAddress: '0x0',
          networkVersion: 1,
        };

        connect.emmiter.emit = jest.fn();
        connect.sendSettings(payload);

        expect(connect.emmiter.emit).toBeCalledWith(
          INPAGE_EVENTS.SETTINGS,
          payload,
        );
      });
    });

    describe('sendResponse', () => {
      it('should send response via emmiter', () => {
        const payload = {
          foo: 'bar',
        };

        connect.emmiter.emit = jest.fn();
        connect.sendResponse(payload);

        expect(connect.emmiter.emit).toBeCalledWith(
          INPAGE_EVENTS.RESPONSE,
          payload,
        );
      });
    });

    describe('injectWeb3', () => {
      it('should inject web3 to target window', () => {
        const target = {};

        connect.injectWeb3(target);

        expect(target.web3).toBeTruthy();
      });

      it('should inject web3 current window if target is not passed', () => {
        connect.injectWeb3();

        expect(window.web3).toBeTruthy();
      });

      it('should inject etherium if web3 already exist in target', () => {
        const target = {
          web3: {},
        };
        const provider = {
          foo: 'bar',
        };

        connect.provider = { ...provider };
        connect.injectWeb3(target);

        expect(target.ethereum).toBeTruthy();
      });
    });
  });
});

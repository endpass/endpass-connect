import web3 from '@/class/singleton/web3';
import { sendMessageToOpener } from '@/util/message';
import coreActions from '@/store/modules/core/actions';
import { DEFAULT_NETWORKS, METHODS } from '@/constants';

describe('core actions', () => {
  let dispatch;
  let commit;

  beforeEach(() => {
    jest.clearAllMocks();

    dispatch = jest.fn();
    commit = jest.fn();
  });

  describe('sendDialogMessage', () => {
    it('should send message with given data', async () => {
      expect.assertions(1);

      const target = {
        foor: 'bar',
      };
      const payload = {
        foo: 'bar',
      };

      await coreActions.sendDialogMessage(null, {
        target,
        payload,
      });

      expect(sendMessageToOpener).toBeCalledWith(target, 'dialog', payload);
    });

    it('should not send message if target is null', async () => {
      const payload = {
        foo: 'bar',
      };

      await coreActions.sendDialogMessage(null, {
        payload,
      });

      expect(sendMessageToOpener).not.toBeCalled();
    });
  });

  describe('sendBridgeMessage', () => {
    it('should send message with given data', async () => {
      expect.assertions(1);

      const target = {
        foo: 'bar',
      };
      const payload = {
        foo: 'bar',
      };

      await coreActions.sendBridgeMessage(null, {
        target,
        payload,
      });

      expect(sendMessageToOpener).toBeCalledWith(target, 'bridge', payload);
    });

    it('should not send message if target is null', async () => {
      const payload = {
        foo: 'bar',
      };

      await coreActions.sendBridgeMessage(null, {
        payload,
      });

      expect(sendMessageToOpener).not.toBeCalled();
    });
  });

  describe('init', () => {
    it('should requests accounts and change init status', async () => {
      expect.assertions(2);

      await coreActions.init({
        commit,
        dispatch,
      });

      expect(dispatch).toBeCalledWith('getAccounts');
      expect(commit).toBeCalledWith('changeInitStatus', true);
    });
  });

  describe('setWeb3NetworkProvider', () => {
    it('should create provider with given network id', async () => {
      await coreActions.setWeb3NetworkProvider(null, 1);

      expect(web3.providers.HttpProvider).toBeCalledWith(
        DEFAULT_NETWORKS[1].url[0],
      );
      expect(web3.setProvider).toBeCalled();
    });
  });

  describe('subscribeOnBridge', () => {
    it('should do something', () => {});
  });

  describe('subscribeOnDialog', () => {
    it('should do something', () => {});
  });

  describe('processLazyMessage', () => {
    it('should process lazy message', async () => {
      const target = {
        foo: 'bar',
      };
      const message = {
        method: 'foo',
      };
      const resolvedMessage = {
        status: true,
      };

      dispatch.mockResolvedValueOnce(true);
      dispatch.mockResolvedValueOnce(resolvedMessage);

      await coreActions.processLazyMessage(
        {
          commit,
          dispatch,
        },
        {
          target,
          message,
        },
      );

      expect(commit).toBeCalledWith('setMessageAwaitingStatus', true);
      expect(dispatch).toBeCalledTimes(3);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        'processSpecificLazyMessage',
        message,
      );
      expect(dispatch).toHaveBeenNthCalledWith(2, 'awaitMessageResolution');
      expect(dispatch).toHaveBeenNthCalledWith(3, 'sendDialogMessage', {
        payload: {
          method: message.method,
          ...resolvedMessage,
        },
        target,
      });
    });
  });

  describe('processSpecificLazyMessage', () => {
    it('should set auth params if message method is AUTH', async () => {
      expect.assertions(1);

      const message = {
        method: METHODS.AUTH,
        foo: 'bar',
        bar: 'baz',
      };

      await coreActions.processSpecificLazyMessage({ commit }, message);

      expect(commit).toBeCalledWith('setAuthParams', {
        foo: 'bar',
        bar: 'baz',
      });
    });

    it('should set request if message method is SIGN', async () => {
      expect.assertions(1);

      const message = {
        method: METHODS.SIGN,
        foo: 'bar',
        bar: 'baz',
      };

      await coreActions.processSpecificLazyMessage({ commit }, message);

      expect(commit).toBeCalledWith('setRequest', {
        foo: 'bar',
        bar: 'baz',
      });
    });
  });
});

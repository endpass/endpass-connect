import get from 'lodash/get';
import omit from 'lodash/omit';
import web3 from '@/class/singleton/web3';
import { createSubscribtion, sendMessageToOpener } from '@/util/message';
import { DEFAULT_NETWORKS, METHODS, LAZY_METHODS } from '@/constants';

const init = async ({ dispatch, commit }) => {
  try {
    await dispatch('getAccounts');
    // eslint-disable-next-line
  } catch (err) {
  } finally {
    commit('changeInitStatus', true);
  }
};

const setWeb3NetworkProvider = (ctx, netId) => {
  const netUrl = get(DEFAULT_NETWORKS, `[${netId}].url[0]`);
  const provider = new web3.providers.HttpProvider(netUrl);

  web3.setProvider(provider);
};

const sendDialogMessage = (ctx, { payload, target }) => {
  if (target) sendMessageToOpener(target, 'dialog', payload);
};

const sendBridgeMessage = (ctx, { payload, target }) => {
  if (target) sendMessageToOpener(target, 'bridge', payload);
};

const sendReadyMessage = ({ dispatch }) => {
  dispatch('sendDialogMessage', {
    payload: {
      method: METHODS.READY_STATE_DIALOG,
      status: true,
    },
  });
};

const subscribeOnBridge = ({ dispatch, rootState }) => {
  const handler = (target, message) => {
    if (message.method === METHODS.READY_STATE_BRIDGE) {
      dispatch('sendBridgeMessage', {
        payload: {
          method: METHODS.READY_STATE_BRIDGE,
          status: true,
        },
        target,
      });
    } else if (message.method === METHODS.GET_SETTINGS) {
      dispatch('getSettings')
        .then(() =>
          dispatch('sendBridgeMessage', {
            payload: {
              method: METHODS.GET_SETTINGS,
              status: true,
              ...rootState.accounts.settings,
            },
            target,
          }),
        )
        .catch(() => {
          dispatch('sendBridgeMessage', {
            payload: {
              method: METHODS.GET_SETTINGS,
              status: false,
            },
            target,
          });
        });
    } else if (message.method === METHODS.RECOVER) {
      dispatch('recoverMessage', message)
        .then(res =>
          dispatch('sendBridgeMessage', {
            payload: {
              method: METHODS.RECOVER,
              status: true,
              ...res,
            },
            target,
          }),
        )
        .catch(() => {
          dispatch('sendBridgeMessage', {
            payload: {
              method: METHODS.RECOVER,
              status: false,
            },
            target,
          });
        });
    } else if (message.method === METHODS.LOGOUT) {
      dispatch('logout')
        .then(() =>
          dispatch('sendBridgeMessage', {
            payload: {
              method: METHODS.LOGOUT,
              status: true,
            },
            target,
          }),
        )
        .catch(() => {
          dispatch('sendBridgeMessage', {
            payload: {
              method: METHODS.LOGOUT,
              status: false,
            },
            target,
          });
        });
    }
  };

  const subscribtion = createSubscribtion('bridge');

  subscribtion.on(handler);
};

const subscribeOnDialog = ({ dispatch }) => {
  const handler = async (target, message) => {
    if (LAZY_METHODS.includes(message.method)) {
      dispatch('processLazyMessage', { target, message });
    } else if (message.method === METHODS.READY_STATE_DIALOG) {
      dispatch('sendDialogMessage', {
        payload: {
          method: METHODS.READY_STATE_DIALOG,
          status: true,
        },
        target,
      });
    } else if (message.method === METHODS.RESIZE_DIALOG) {
      dispatch('sendDialogMessage', {
        payload: {
          method: METHODS.RESIZE_DIALOG,
          result: document.body.offsetHeight,
          status: true,
        },
        target,
      });
    }
  };

  const subscribtion = createSubscribtion('dialog');

  subscribtion.on(handler);
};

const processLazyMessage = async (
  { commit, dispatch },
  { target, message },
) => {
  commit('setAuthParams', omit(message, 'method'));
  commit('setMessageAwaitingStatus', true);

  await dispatch('processSpecificLazyMessage', message);

  const res = await dispatch('awaitMessageResolution');

  dispatch('sendDialogMessage', {
    payload: {
      method: message.method,
      ...res,
    },
    target,
  });
};

const processSpecificLazyMessage = async ({ commit }, message) => {
  if (message.method === METHODS.AUTH) {
    commit('setAuthParams', omit(message, ['method']));
  } else if (message.method === METHODS.SIGN) {
    commit('setRequest', omit(message, ['method']));
  }
};

const closeDialog = () => {
  window.close();
};

export default {
  init,
  setWeb3NetworkProvider,
  sendDialogMessage,
  sendBridgeMessage,
  sendReadyMessage,
  subscribeOnBridge,
  subscribeOnDialog,
  processLazyMessage,
  processSpecificLazyMessage,
  closeDialog,
};

import get from 'lodash/get';
import web3 from '@@/class/singleton/web3';
import {
  sendMessageToOpener,
  subscribeOnBridgeMessages,
} from '@@/util/message';
import { DEFAULT_NETWORKS } from '@@/constants';

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

const sendMessage = (ctx, data) => {
  sendMessageToOpener({
    from: 'dialog',
    data,
  });
};

const sendBridgeMessage = (ctx, data) => {
  sendMessageToOpener({
    from: 'bridge',
    data,
  });
};

const sendReadyMessage = ({ dispatch }) => {
  dispatch('sendMessage', {
    method: 'connect_ready',
    status: true,
  });
};

const subscribeOnBridge = ({ dispatch }) => {
  const handler = message => {
    if (message.method === 'get_accounts') {
      dispatch('getSettings')
        .then(res => {
          dispatch('sendBridgeMessage', {
            status: true,
            ...res,
          });
        })
        .catch(() => {
          dispatch('sendBridgeMessage', {
            status: false,
          });
        });
    } else if (message.method === 'check_ready') {
      dispatch('sendBridgeMessage', {
        status: true,
      });
    }
  };

  subscribeOnBridgeMessages(handler);
};

const closeDialog = () => {
  window.close();
};

export default {
  init,
  setWeb3NetworkProvider,
  sendMessage,
  sendBridgeMessage,
  sendReadyMessage,
  subscribeOnBridge,
  closeDialog,
};

import get from 'lodash/get';
import web3 from '@@/class/singleton/web3';
import { sendMessageToOpener } from '@@/util/message';
import { DEFAULT_NETWORKS } from '@@/constants';

const setWeb3NetworkProvider = (ctx, netId) => {
  const netUrl = get(DEFAULT_NETWORKS, `[${netId}].url[0]`);
  const provider = new web3.providers.HttpProvider(netUrl);

  web3.setProvider(provider);
};

const sendMessage = (ctx, data) => {
  sendMessageToOpener({ data });
};

const sendReadyMessage = ({ dispatch }) => {
  dispatch('sendMessage', {
    method: 'connect_ready',
    status: true,
  });
};

const closeDialog = () => {
  window.close();
};

export default {
  setWeb3NetworkProvider,
  sendMessage,
  sendReadyMessage,
  closeDialog,
};

import { sendMessageToOpener } from '@@/util/message';

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
  sendMessage,
  sendReadyMessage,
  closeDialog,
};

import { sendMessageToOpener } from '@@/util/message';

const sendMessage = (ctx, data) => {
  sendMessageToOpener({
    data,
  });
};

const closeDialog = () => {
  window.close();
};

export default {
  sendMessage,
  closeDialog,
};

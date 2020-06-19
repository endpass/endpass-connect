import { MESSENGER_METHODS } from '@/constants';

const readyDialog = plugin => (payload, req) => {
  if (req.source === plugin.dialogMessenger.target) {
    plugin.handleReady(payload);
  }
};

const resize = plugin => payload => {
  plugin.resize(payload);
};

const close = plugin => () => {
  plugin.close();
};

const open = plugin => () => {
  plugin.open();
};

const connectionOpen = plugin => () => {
  plugin.connectionOpen();
};

const connectionError = plugin => () => {
  plugin.connectionError();
};

export default {
  [MESSENGER_METHODS.BRIDGE_CONNECTION_READY]: readyDialog,
  [MESSENGER_METHODS.BRIDGE_CONNECTION_OPEN]: connectionOpen,
  [MESSENGER_METHODS.BRIDGE_CONNECTION_ERROR]: connectionError,
  [MESSENGER_METHODS.DIALOG_RESIZE]: resize,
  [MESSENGER_METHODS.DIALOG_CLOSE]: close,
  [MESSENGER_METHODS.DIALOG_OPEN]: open,
};

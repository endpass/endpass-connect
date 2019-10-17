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

export default {
  [MESSENGER_METHODS.READY_STATE_BRIDGE]: readyDialog,
  [MESSENGER_METHODS.DIALOG_RESIZE]: resize,
  [MESSENGER_METHODS.DIALOG_CLOSE]: close,
  [MESSENGER_METHODS.DIALOG_OPEN]: open,
};

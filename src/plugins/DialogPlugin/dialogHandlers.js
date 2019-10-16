/* eslint-disable no-param-reassign */
import { MESSENGER_METHODS } from '@/constants';

const readyDialog = plugin => (payload, req) => {
  if (req.source === plugin.dialogMessenger.target) {
    plugin.handleReady(payload);
  }
};

const initiate = plugin => (payload, req) => {
  // if (req.source === plugin.dialogMessenger.target) {
  //   plugin.handleInitiate();
  // }
};

const resize = plugin => payload => {
  plugin.handleResize(payload);
};

const close = plugin => () => {
  plugin.handleClose();
};

const open = plugin => () => {
  plugin.handleOpen();
};

export default {
  [MESSENGER_METHODS.READY_STATE_BRIDGE]: readyDialog,
  [MESSENGER_METHODS.INITIATE]: initiate,
  [MESSENGER_METHODS.DIALOG_RESIZE]: resize,
  [MESSENGER_METHODS.DIALOG_CLOSE]: close,
  [MESSENGER_METHODS.DIALOG_OPEN]: open,
};

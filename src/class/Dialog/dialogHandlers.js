/* eslint-disable no-param-reassign */
import { MESSENGER_METHODS } from '@/constants';
import StateClose from '@/class/Dialog/states/StateClose';
import StateOpen from '@/class/Dialog/states/StateOpen';

const readyDialog = dialog => (payload, req) => {
  if (req.source === dialog.dialogMessenger.target) {
    dialog.ready = true;
    dialog.readyResolvers.forEach(item => item(true));
    dialog.readyResolvers.length = 0;
  }
};

const initiate = dialog => (payload, req) => {
  if (req.source === dialog.dialogMessenger.target) {
    clearTimeout(dialog.initialTimer);
  }
};

const resize = dialog => ({ offsetHeight }) => {
  dialog.frame.style = dialog.frameStyles({
    'min-height': `${offsetHeight || 0}px`,
  });
};

const close = dialog => () => {
  dialog.state.onClose();
  dialog.state = new StateClose(dialog);
};

const open = dialog => () => {
  dialog.state.onOpen();
  dialog.state = new StateOpen(dialog);
};

export default {
  [MESSENGER_METHODS.READY_STATE_BRIDGE]: readyDialog,
  [MESSENGER_METHODS.INITIATE]: initiate,
  [MESSENGER_METHODS.DIALOG_RESIZE]: resize,
  [MESSENGER_METHODS.DIALOG_CLOSE]: close,
  [MESSENGER_METHODS.DIALOG_OPEN]: open,
};

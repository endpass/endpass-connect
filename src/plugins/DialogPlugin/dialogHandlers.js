/* eslint-disable no-param-reassign */
import { MESSENGER_METHODS } from '@/constants';
import StateClose from '@/plugins/DialogPlugin/states/StateClose';
import StateOpen from '@/plugins/DialogPlugin/states/StateOpen';

const readyDialog = plugin => (payload, req) => {
  if (req.source === plugin.dialogMessenger.target) {
    console.log('--- connect. readyDialog');
    plugin.ready = true;
    plugin.readyResolvers.forEach(item => item(true));
    plugin.readyResolvers.length = 0;
    clearTimeout(plugin.initialTimer);
  }
};

const initiate = plugin => (payload, req) => {
  if (req.source === plugin.dialogMessenger.target) {
    clearTimeout(plugin.initialTimer);
  }
};

const resize = plugin => payload => {
  plugin.dialog.resize(payload);
};

const close = plugin => () => {
  plugin.state.onClose();
  plugin.state = new StateClose(plugin);
};

const open = plugin => () => {
  plugin.state.onOpen();
  plugin.state = new StateOpen(plugin);
};

export default {
  [MESSENGER_METHODS.READY_STATE_BRIDGE]: readyDialog,
  [MESSENGER_METHODS.INITIATE]: initiate,
  [MESSENGER_METHODS.DIALOG_RESIZE]: resize,
  [MESSENGER_METHODS.DIALOG_CLOSE]: close,
  [MESSENGER_METHODS.DIALOG_OPEN]: open,
};

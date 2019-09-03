import { METHODS } from '@/constants';
import StateClose from '@/class/Dialog/states/StateClose';
import StateOpen from '@/class/Dialog/states/StateOpen';

function readyDialog(payload, req) {
  if (req.source === this.dialogMessenger.target) {
    this.ready = true;
    this.readyResolvers.forEach(item => item(true));
    this.readyResolvers.length = 0;
  }
}

function initiate(payload, req) {
  if (req.source === this.dialogMessenger.target) {
    clearTimeout(this.initialTimer);
  }
}

function resize({ offsetHeight }) {
  this.frame.style = this.frameStyles({
    'min-height': `${offsetHeight || 0}px`,
  });
}

function close() {
  this.state.onClose();
  this.state = new StateClose(this);
}

function open() {
  this.state.onOpen();
  this.state = new StateOpen(this);
}

export default {
  [METHODS.READY_STATE_BRIDGE]: readyDialog,
  [METHODS.INITIATE]: initiate,
  [METHODS.DIALOG_RESIZE]: resize,
  [METHODS.DIALOG_CLOSE]: close,
  [METHODS.DIALOG_OPEN]: open,
  [METHODS.LOGOUT_REQUEST]: () => {},
};

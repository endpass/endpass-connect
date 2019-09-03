import { METHODS, WIDGET_EVENTS } from '@/constants';
import StateExpand from '@/class/Widget/states/StateExpand';
import StateCollapse from '@/class/Widget/states/StateCollapse';
import StateOpen from '@/class/Widget/states/StateOpen';
import StateClose from '@/class/Widget/states/StateClose';

function handleInit(payload, req) {
  req.answer({
    position: this.position,
    isMobile: this.isMobile,
  });
}

function expand(payload, req) {
  this.stateCompact.onExpand();
  this.stateCompact = new StateExpand(this);
  req.answer();
}

function collapse() {
  this.stateCompact.onCollapse();
  this.stateCompact = new StateCollapse(this);
}

function open({ root }, req) {
  this.state.onOpen(root);
  this.state = new StateOpen(this);
  req.answer();
}

function close() {
  this.state.onClose();
  this.state = new StateClose(this);
}

function fit({ height }) {
  this.resize({ height: `${height}px` });
}

function unmount() {
  this.unmount();
}

function logout() {
  this.messengerGroup.send(METHODS.WIDGET_UNMOUNT);
  this.emitFrameEvent(this.frame, WIDGET_EVENTS.LOGOUT);
}

function changeSettings(payload) {
  this.emitFrameEvent(this.frame, WIDGET_EVENTS.UPDATE, payload);
}

export default {
  [METHODS.INITIATE]: () => {}, // ????
  [METHODS.WIDGET_INIT]: handleInit,
  [METHODS.WIDGET_EXPAND_REQUEST]: expand,
  [METHODS.WIDGET_COLLAPSE_REQUEST]: collapse,
  [METHODS.WIDGET_OPEN]: open,
  [METHODS.WIDGET_CLOSE]: close,
  [METHODS.WIDGET_FIT]: fit,
  [METHODS.WIDGET_UNMOUNT]: unmount,
  [METHODS.LOGOUT_REQUEST]: logout,
  [METHODS.CHANGE_SETTINGS_REQUEST]: changeSettings,
};

/* eslint-disable no-param-reassign */
import { METHODS, WIDGET_EVENTS } from '@/constants';
import StateExpand from '@/class/Widget/states/StateExpand';
import StateCollapse from '@/class/Widget/states/StateCollapse';
import StateOpen from '@/class/Widget/states/StateOpen';
import StateClose from '@/class/Widget/states/StateClose';

const handleInit = widget => (payload, req) => {
  req.answer({
    position: widget.position,
    isMobile: widget.isMobile,
  });
};

const expand = widget => (payload, req) => {
  widget.stateCompact.onExpand();
  widget.stateCompact = new StateExpand(widget);
  req.answer();
};

const collapse = widget => () => {
  widget.stateCompact.onCollapse();
  widget.stateCompact = new StateCollapse(widget);
};

const open = widget => ({ root }, req) => {
  widget.state.onOpen(root);
  widget.state = new StateOpen(widget);
  req.answer();
};

const close = widget => () => {
  widget.state.onClose();
  widget.state = new StateClose(widget);
};

const fit = widget => ({ height }) => {
  widget.resize({ height: `${height}px` });
};

const unmount = widget => () => {
  widget.unmount();
};

const logout = widget => () => {
  widget.messengerGroup.send(METHODS.WIDGET_UNMOUNT);
  widget.emitFrameEvent(widget.frame, WIDGET_EVENTS.LOGOUT);
};

const changeSettings = widget => payload => {
  widget.emitFrameEvent(widget.frame, WIDGET_EVENTS.UPDATE, payload);
};

export default {
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

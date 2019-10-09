/* eslint-disable no-param-reassign */
import { MESSENGER_METHODS, WIDGET_EVENTS } from '@/constants';
import StateExpand from '@/plugins/WidgetPlugin/states/StateExpand';
import StateCollapse from '@/plugins/WidgetPlugin/states/StateCollapse';
import StateOpen from '@/plugins/WidgetPlugin/states/StateOpen';
import StateClose from '@/plugins/WidgetPlugin/states/StateClose';

const expand = widget => () => {
  widget.stateCompact.onExpand();
  widget.stateCompact = new StateExpand(widget);
};

const collapse = widget => () => {
  widget.stateCompact.onCollapse();
  widget.stateCompact = new StateCollapse(widget);
};

const open = widget => ({ root }) => {
  widget.state.onOpen(root);
  widget.state = new StateOpen(widget);
};

const close = widget => () => {
  widget.state.onClose();
  widget.state = new StateClose(widget);
};

const fit = widget => ({ height }) => {
  widget.resize({ height: `${height}px` });
};

const logout = widget => () => {
  widget.emitFrameEvent(widget.frame, WIDGET_EVENTS.LOGOUT);
};

const changeSettings = widget => payload => {
  widget.emitFrameEvent(widget.frame, WIDGET_EVENTS.UPDATE, payload);
};

export default {
  [MESSENGER_METHODS.WIDGET_EXPAND_REQUEST]: expand,
  [MESSENGER_METHODS.WIDGET_COLLAPSE_REQUEST]: collapse,
  [MESSENGER_METHODS.WIDGET_OPEN]: open,
  [MESSENGER_METHODS.WIDGET_CLOSE]: close,
  [MESSENGER_METHODS.WIDGET_FIT]: fit,
  [MESSENGER_METHODS.WIDGET_LOGOUT]: logout,
  [MESSENGER_METHODS.CHANGE_SETTINGS_REQUEST]: changeSettings,
};

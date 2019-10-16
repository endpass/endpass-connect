import { MESSENGER_METHODS } from '@/constants';

const resizeView = plugin => payload => {
  plugin.handleResizeView(payload);
};

const readyView = plugin => (payload, req) => {
  plugin.handleReadyView(payload, req);
};

export default {
  [MESSENGER_METHODS.READY_STATE_BRIDGE]: readyView,
  [MESSENGER_METHODS.DIALOG_RESIZE]: resizeView,
};

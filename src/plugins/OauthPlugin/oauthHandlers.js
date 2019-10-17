import { MESSENGER_METHODS } from '@/constants';

const resizeFrame = plugin => payload => {
  plugin.resizeFrame(payload);
};

const readyFrame = plugin => (payload, req) => {
  plugin.handleReadyFrame(payload, req);
};

export default {
  [MESSENGER_METHODS.READY_STATE_BRIDGE]: readyFrame,
  [MESSENGER_METHODS.DIALOG_RESIZE]: resizeFrame,
};

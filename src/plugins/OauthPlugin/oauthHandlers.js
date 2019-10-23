import { MESSENGER_METHODS } from '@/constants';

const resizeFrame = plugin => (payload, req) => {
  if (!plugin.isSourceEqualTarget(req.source)) {
    return;
  }
  plugin.resizeFrame(payload);
};

const readyFrame = plugin => (payload, req) => {
  if (!plugin.isSourceEqualTarget(req.source)) {
    return;
  }
  plugin.handleReadyFrame(payload, req);
};

const closeFrame = plugin => (payload, req) => {
  if (!plugin.isSourceEqualTarget(req.source)) {
    return;
  }
  plugin.handleCloseFrame();
};

export default {
  [MESSENGER_METHODS.READY_STATE_BRIDGE]: readyFrame,
  [MESSENGER_METHODS.DIALOG_RESIZE]: resizeFrame,
  [MESSENGER_METHODS.DIALOG_CLOSE]: closeFrame,
};

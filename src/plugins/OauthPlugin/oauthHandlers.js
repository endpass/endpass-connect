// @ts-check
import { MESSENGER_METHODS } from '@/constants';

/**
 * @param {OauthPlugin} plugin
 * @returns {OauthResizeFrameEventHandler}
 */
const resizeFrame = plugin => (payload, req) => {
  if (!plugin.isSourceEqualTarget(req.source)) {
    return;
  }

  plugin.resizeFrame(payload);
};

/**
 * @param {OauthPlugin} plugin
 * @returns {RequestEventHandler}
 */
const readyFrame = plugin => (payload, req) => {
  if (!plugin.isSourceEqualTarget(req.source)) {
    return;
  }

  plugin.handleReadyFrame();
};

/**
 * @param {OauthPlugin} plugin
 * @returns {RequestEventHandler}
 */
const closeFrame = plugin => (payload, req) => {
  if (!plugin.isSourceEqualTarget(req.source)) {
    return;
  }

  plugin.handleCloseFrame();
};

/**
 * @param {OauthPlugin} plugin
 * @returns {RequestEventHandler}
 */
const authStatus = plugin => payload => {
  const { code, hash } = payload;
  plugin.changeAuthStatus({ code, hash });
};

export default {
  [MESSENGER_METHODS.AUTH_STATUS]: authStatus,
  [MESSENGER_METHODS.READY_STATE_BRIDGE]: readyFrame,
  [MESSENGER_METHODS.DIALOG_RESIZE]: resizeFrame,
  [MESSENGER_METHODS.DIALOG_CLOSE]: closeFrame,
};

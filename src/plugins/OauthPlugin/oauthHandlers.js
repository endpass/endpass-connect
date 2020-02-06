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
const connectionOpen = plugin => (payload, req) => {
  if (!plugin.isSourceEqualTarget(req.source)) {
    return;
  }
  plugin.connectionOpen();
};

/**
 * @param {OauthPlugin} plugin
 * @returns {RequestEventHandler}
 */
const connectionError = plugin => (payload, req) => {
  if (!plugin.isSourceEqualTarget(req.source)) {
    return;
  }

  plugin.connectionError();
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
  [MESSENGER_METHODS.BRIDGE_CONNECTION_READY]: readyFrame,
  [MESSENGER_METHODS.BRIDGE_CONNECTION_OPEN]: connectionOpen,
  [MESSENGER_METHODS.BRIDGE_CONNECTION_ERROR]: connectionError,
  [MESSENGER_METHODS.DIALOG_RESIZE]: resizeFrame,
  [MESSENGER_METHODS.DIALOG_CLOSE]: closeFrame,
};

// @ts-check
import ConnectError from '@/class/ConnectError';
import { PLUGIN_METHODS, MESSENGER_METHODS, PLUGIN_NAMES } from '@/constants';

const { ERRORS } = ConnectError;

/**
 * @returns {RequestEventHandler}
 */
const getVersion = () => (payload, req) => {
  req.answer(ENV.authVersion);
};

/**
 * @param {Context} context
 * @returns {RequestEventHandler}
 */
const initiate = context => (payload, req) => {
  const { isIdentityMode } = context.options;

  req.answer({
    isIdentityMode: isIdentityMode || false,
    originLocation: window.location.origin,
  });
};

/**
 * @param {Context} context
 * @returns {RequestEventHandler}
 */
const changeSettings = context => async (payload, req) => {
  try {
    await context.executeMethod(
      PLUGIN_METHODS.CONTEXT_SET_PROVIDER_SETTINGS,
      payload,
    );

    req.answer({
      status: true,
    });
  } catch (error) {
    console.error(error);
    const code = (error && error.code) || ERRORS.PROVIDER;
    throw ConnectError.create(code);
  }
};

/**
 * @param {Context} context
 * @returns {RequestEventHandler}
 */
const widgetGetSettings = context => (payload, req) => {
  const settings = context.plugins.provider.getInpageProviderSettings();
  req.answer(settings);
};

/**
 * @param {Context} context
 * @returns {RequestEventHandler}
 */
const authorize = context => async (payload, req) => {
  const res = await context.plugins.authorize.authorizeMe(payload);
  req.answer(res);
};

/**
 * @param {Context} context
 * @returns {RequestEventHandler}
 */
const setProviderSettings = context => payload => {
  context.plugins.provider.setInpageProviderSettings(payload);

  const settings = context.plugins.provider.getInpageProviderSettings();

  context.plugins.messengerGroup.send(
    MESSENGER_METHODS.CHANGE_SETTINGS_RESPONSE,
    settings,
  );
};

/**
 * @param {Context} context
 * @returns {RequestEventHandler}
 */
const initWidget = context => (payload, req) => {
  req.answer(context.plugins.widget.mountSettings);
};

/**
 * @param {Context} context
 * @returns {RequestEventHandler}
 */
const logout = context => async (payload, req) => {
  try {
    const { authorize: authPlugin, messengerGroup } = context.plugins;
    const res = await authPlugin.logout();

    await context.executeMethod(MESSENGER_METHODS.WIDGET_LOGOUT);

    messengerGroup.send(MESSENGER_METHODS.LOGOUT_RESPONSE);
    if (PLUGIN_NAMES.WIDGET in context.plugins) {
      await context.executeMethod(MESSENGER_METHODS.WIDGET_UNMOUNT);
    }
    await context.executeMethod(MESSENGER_METHODS.DIALOG_CLOSE);

    req.answer({
      status: res,
    });
  } catch (error) {
    throw ConnectError.createFromError(error, ERRORS.AUTH_LOGOUT);
  }
};

/**
 * @param {Context} context
 * @returns {RequestEventHandler}
 */
const unmountWidget = context => async () => {
  await context.plugins.widget.unmount();
  context.plugins.messengerGroup.removeMessenger(
    context.plugins.widget.messenger,
  );
};

/**
 * @param {Context} context
 * @returns {RequestEventHandler}
 */
const mountWidget = context => async () => {
  await context.plugins.widget.mount();
  context.plugins.messengerGroup.addMessenger(context.plugins.widget.messenger);
};

/**
 * @param {Context} context
 * @returns {RequestEventHandler}
 */
const initDialog = context => () => {
  const { bridge } = context.plugins;
  const handler = () => {
    bridge.mount();
    context.plugins.messengerGroup.addMessenger(bridge.messenger);
  };

  if (document.readyState !== 'complete') {
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'complete') {
        handler();
      }
    });
  } else {
    handler();
  }
};

/**
 * @param {Context} context
 * @returns {RequestEventHandler}
 */
const loginWithOauth = context => async (payload, req) => {
  const oauthServer = context.options.oauthServer || ENV.oauthServer;
  const { data } = await context.plugins.oauth.request({
    url: `${oauthServer}/user`,
    scopes: ['user:email:read'],
  });
  req.answer(data);
};

/**
 * @param {Context} context
 * @returns {RequestEventHandler}
 */
const createDocument = context => async (payload, req) => {
  const res = await context.plugins.document.createDocument(payload);
  req.answer(res);
};

/**
 * @param {Context} context
 * @returns {RequestEventHandler}
 */
const createDocumentsRequired = context => async (payload, req) => {
  const res = await context.plugins.document.createDocumentsRequired(payload);
  req.answer(res);
};

/**
 * @param {Context} context
 * @returns {RequestEventHandler}
 */
const toggleWidget = context => async ({ status }) => {
  if (!(PLUGIN_NAMES.WIDGET in context.plugins)) {
    return;
  }

  if (!status) {
    await context.executeMethod(MESSENGER_METHODS.WIDGET_UNMOUNT);
    return;
  }

  if (status && context.options.widget !== false) {
    await context.executeMethod(PLUGIN_METHODS.CONTEXT_MOUNT_WIDGET);
  }
};

/**
 * @param {Context} context
 * @returns {RequestEventHandler}
 */
const connectionError = context => async () => {
  if (!(PLUGIN_NAMES.WIDGET in context.plugins)) {
    return;
  }
  await context.executeMethod(MESSENGER_METHODS.WIDGET_UNMOUNT);
};

export default {
  [MESSENGER_METHODS.BRIDGE_CONNECTION_ERROR]: connectionError,
  [MESSENGER_METHODS.GET_VERSION]: getVersion,
  [MESSENGER_METHODS.AUTH_STATUS]: toggleWidget,
  [PLUGIN_METHODS.CONTEXT_AUTHORIZE]: authorize,
  [MESSENGER_METHODS.LOGOUT_REQUEST]: logout,

  [MESSENGER_METHODS.WIDGET_INIT]: initWidget,
  [MESSENGER_METHODS.WIDGET_UNMOUNT]: unmountWidget,
  [PLUGIN_METHODS.CONTEXT_MOUNT_WIDGET]: mountWidget,

  [MESSENGER_METHODS.INITIATE]: initiate,
  [PLUGIN_METHODS.CONTEXT_MOUNT_DIALOG]: initDialog,

  [MESSENGER_METHODS.CHANGE_SETTINGS_REQUEST]: changeSettings,
  [MESSENGER_METHODS.WIDGET_GET_SETTING]: widgetGetSettings,
  [PLUGIN_METHODS.CONTEXT_SET_PROVIDER_SETTINGS]: setProviderSettings,
  [PLUGIN_METHODS.CONTEXT_CREATE_DOCUMENT]: createDocument,
  [PLUGIN_METHODS.CONTEXT_CREATE_DOCUMENTS_REQUIRED]: createDocumentsRequired,
  [PLUGIN_METHODS.CONTEXT_OAUTH_AUTHORIZE]: loginWithOauth,
};

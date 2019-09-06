import ConnectError from '@endpass/class/ConnectError';
import { PLUGIN_METHODS, MESSENGER_METHODS } from '@/constants';

const { ERRORS } = ConnectError;

const initiate = context => (payload, req) => {
  const { demoData, isIdentityMode, showCreateAccount } = context.options;

  req.answer({
    demoData,
    isIdentityMode: isIdentityMode || false,
    showCreateAccount,
  });
};

const changeSettings = context => (payload, req) => {
  try {
    context.setProviderSettings(payload);

    req.answer({
      status: true,
    });
  } catch (error) {
    const code = (error && error.code) || ERRORS.AUTH_LOGOUT;
    req.answer({
      status: false,
      error,
      code,
    });
    throw ConnectError.create(code);
  }
};

const getSettings = context => (payload, req) => {
  req.answer(context.inpageProvider.settings);
};

const authorize = context => async (payload, req) => {
  const res = await context.plugins.authorize.authorizeMe(payload);
  req.answer(res);
};

const getWidgetNode = context => async (payload, req) => {
  const res = await context.plugins.widget.getWidgetNode();
  req.answer(res);
};

const serverAuth = context => async () => {
  await context.plugins.provider.serverAuth();
};

const setRequestProvider = context => provider => {
  context.plugins.provider.setRequestProvider(provider);
};

export default {
  [MESSENGER_METHODS.INITIATE]: initiate,
  [MESSENGER_METHODS.CHANGE_SETTINGS_REQUEST]: changeSettings,
  [MESSENGER_METHODS.WIDGET_GET_SETTING]: getSettings,
  [PLUGIN_METHODS.CONTEXT_AUTHORIZE]: authorize,
  [PLUGIN_METHODS.CONTEXT_GET_WIDGET_NODE]: getWidgetNode,
  [PLUGIN_METHODS.CONTEXT_SERVER_AUTH]: serverAuth,
  [PLUGIN_METHODS.CONTEXT_SET_REQUEST_PROVIDER]: setRequestProvider,
};

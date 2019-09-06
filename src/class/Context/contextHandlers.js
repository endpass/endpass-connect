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

const changeSettings = context => async (payload, req) => {
  try {
    await context.handleRequest(
      PLUGIN_METHODS.CONTEXT_SET_PROVIDER_SETTINGS,
      payload,
    );

    req.answer({
      status: true,
    });
  } catch (error) {
    console.error(error);
    debugger;
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

const setProviderSettings = context => async payload => {
  context.plugins.provider.setInpageProviderSettings(payload);

  console.log('!!! --- settings sets', payload);
  const settings = context.getInpageProviderSettings();
  await context.handleRequest(PLUGIN_METHODS.MESSENGER_GROUP_SEND, {
    method: MESSENGER_METHODS.CHANGE_SETTINGS_RESPONSE,
    payload: settings,
  });
  console.log('!!! --- MESSENGER_GROUP_SEND');
};

export default {
  [MESSENGER_METHODS.INITIATE]: initiate,
  [MESSENGER_METHODS.CHANGE_SETTINGS_REQUEST]: changeSettings,
  [MESSENGER_METHODS.WIDGET_GET_SETTING]: getSettings,
  [PLUGIN_METHODS.CONTEXT_AUTHORIZE]: authorize,
  [PLUGIN_METHODS.CONTEXT_GET_WIDGET_NODE]: getWidgetNode,
  [PLUGIN_METHODS.CONTEXT_SERVER_AUTH]: serverAuth,
  [PLUGIN_METHODS.CONTEXT_SET_REQUEST_PROVIDER]: setRequestProvider,
  [PLUGIN_METHODS.CONTEXT_SET_PROVIDER_SETTINGS]: setProviderSettings,
};

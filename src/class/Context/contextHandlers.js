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
    await context.executeMethod(
      PLUGIN_METHODS.CONTEXT_SET_PROVIDER_SETTINGS,
      payload,
    );

    req.answer({
      status: true,
    });
  } catch (error) {
    console.error(error);
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
  const settings = context.plugins.provider.getInpageProviderSettings();
  req.answer(settings);
};

const authorize = context => async (payload, req) => {
  const res = await context.plugins.authorize.authorizeMe(payload);
  req.answer(res);
};

const setProviderSettings = context => async payload => {
  context.plugins.provider.setInpageProviderSettings(payload);

  const settings = context.plugins.provider.getInpageProviderSettings();

  context.plugins.messengerGroup.send(
    MESSENGER_METHODS.CHANGE_SETTINGS_RESPONSE,
    settings,
  );
};

export default {
  [MESSENGER_METHODS.INITIATE]: initiate,
  [MESSENGER_METHODS.CHANGE_SETTINGS_REQUEST]: changeSettings,
  [MESSENGER_METHODS.WIDGET_GET_SETTING]: getSettings,
  [PLUGIN_METHODS.CONTEXT_AUTHORIZE]: authorize,
  [PLUGIN_METHODS.CONTEXT_SET_PROVIDER_SETTINGS]: setProviderSettings,
};

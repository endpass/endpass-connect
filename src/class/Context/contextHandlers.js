import ConnectError from '@endpass/class/ConnectError';
import { METHODS } from '@/constants';

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

export default {
  [METHODS.INITIATE]: initiate,
  [METHODS.CHANGE_SETTINGS_REQUEST]: changeSettings,
  [METHODS.WIDGET_GET_SETTING]: getSettings,
};

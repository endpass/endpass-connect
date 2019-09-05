import ConnectError from '@endpass/class/ConnectError';
import { METHODS } from '@/constants';

const { ERRORS } = ConnectError;

const initiate = context => (payload, req) => {
  req.answer({
    ...context.initialPayload,
  });
};

const authStatus = context => status => {
  context.getAuthRequester().isLogin = status;
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

const logout = context => async (payload, req) => {
  try {
    const res = await context.getAuthRequester().logout();

    context.messengerGroup.send(METHODS.DIALOG_CLOSE);

    req.answer({
      status: res,
    });
  } catch (error) {
    const code = (error && error.code) || ERRORS.AUTH_LOGOUT;
    throw ConnectError.create(code);
  }
};

export default {
  [METHODS.INITIATE]: initiate,
  [METHODS.AUTH_STATUS]: authStatus,
  [METHODS.CHANGE_SETTINGS_REQUEST]: changeSettings,
  [METHODS.WIDGET_GET_SETTING]: getSettings,
  [METHODS.LOGOUT_REQUEST]: logout,
};

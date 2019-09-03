import ConnectError from '@endpass/class/ConnectError';
import { METHODS } from '@/constants';

const { ERRORS } = ConnectError;

function initiate(payload, req) {
  req.answer({
    ...this.initialPayload,
  });
}

function authStatus(status) {
  debugger;
  this.getAuthRequester().isLogin = status;
}

function changeSettings(payload, req) {
  try {
    this.setProviderSettings(payload);

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
}

function getSettings(payload, req) {
  req.answer(this.inpageProvider.settings);
}

async function logout(payload, req) {
  try {
    await this.logout();

    this.messengerGroup.send(METHODS.DIALOG_CLOSE);

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
}

export default {
  [METHODS.INITIATE]: initiate,
  [METHODS.AUTH_STATUS]: authStatus,
  [METHODS.CHANGE_SETTINGS_REQUEST]: changeSettings,
  [METHODS.WIDGET_GET_SETTING]: getSettings,
  [METHODS.LOGOUT_REQUEST]: logout,
};

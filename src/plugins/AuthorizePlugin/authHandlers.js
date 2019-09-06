import ConnectError from '@endpass/class/ConnectError';
import { MESSENGER_METHODS } from '@/constants';

const { ERRORS } = ConnectError;

const authStatus = auth => status => {
  // eslint-disable-next-line no-param-reassign
  auth.isLogin = status;
};

const logout = auth => async (payload, req) => {
  try {
    const res = await auth.logout();

    req.answer({
      status: res,
    });
  } catch (error) {
    throw ConnectError.createFromError(error, ERRORS.AUTH_LOGOUT);
  }
};

export default {
  [MESSENGER_METHODS.AUTH_STATUS]: authStatus,
  [MESSENGER_METHODS.LOGOUT_REQUEST]: logout,
};

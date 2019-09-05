import ConnectError from '@endpass/class/ConnectError';
import { METHODS } from '@/constants';

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
    const code = (error && error.code) || ERRORS.AUTH_LOGOUT;
    throw ConnectError.create(code);
  }
};

export default {
  [METHODS.AUTH_STATUS]: authStatus,
  [METHODS.LOGOUT_REQUEST]: logout,
};

import { MESSENGER_METHODS } from '@/constants';

const authStatus = auth => payload => {
  // TODO: remove after all connect sub repos will be updated, old structure support
  // eslint-disable-next-line no-prototype-builtins
  const status = payload.hasOwnProperty('status') ? payload.status : payload;

  // eslint-disable-next-line no-param-reassign
  auth.isLogin = status;
};

export default {
  [MESSENGER_METHODS.AUTH_STATUS]: authStatus,
};

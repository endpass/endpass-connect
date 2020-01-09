import { MESSENGER_METHODS } from '@/constants';

const authStatus = auth => ({ status }) => {
  // eslint-disable-next-line no-param-reassign
  auth.isLogin = status;
};

export default {
  [MESSENGER_METHODS.AUTH_STATUS]: authStatus,
};

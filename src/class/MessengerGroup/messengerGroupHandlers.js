import { METHODS } from '@/constants';

const logout = messengerGroup => () => {
  messengerGroup.send(METHODS.DIALOG_CLOSE);
  messengerGroup.send(METHODS.WIDGET_UNMOUNT);
};

export default {
  [METHODS.LOGOUT_REQUEST]: logout,
};

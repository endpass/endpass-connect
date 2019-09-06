import { MESSENGER_METHODS, PLUGIN_METHODS } from '@/constants';

const logout = messengerGroup => () => {
  messengerGroup.send(MESSENGER_METHODS.DIALOG_CLOSE);
  messengerGroup.send(MESSENGER_METHODS.WIDGET_UNMOUNT);
};

const add = messengerGroup => messenger => {
  messengerGroup.addMessenger(messenger);
};

const remove = messengerGroup => messenger => {
  messengerGroup.removeMessenger(messenger);
};

export default {
  [MESSENGER_METHODS.LOGOUT_REQUEST]: logout,
  [PLUGIN_METHODS.MESSENGER_GROUP_ADD]: add,
  [PLUGIN_METHODS.MESSENGER_GROUP_REMOVE]: remove,
};

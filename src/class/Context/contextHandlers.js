import ConnectError from '@endpass/class/ConnectError';
import { PLUGIN_METHODS, MESSENGER_METHODS } from '@/constants';

const WIDGET_AUTH_TIMEOUT = 200;

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
    throw ConnectError.create(code);
  }
};

const widgetGetSettings = context => (payload, req) => {
  const settings = context.plugins.provider.getInpageProviderSettings();
  req.answer(settings);
};

const authorize = context => async (payload, req) => {
  const res = await context.plugins.authorize.authorizeMe(payload);
  req.answer(res);
};

const setProviderSettings = context => payload => {
  context.plugins.provider.setInpageProviderSettings(payload);

  const settings = context.plugins.provider.getInpageProviderSettings();

  context.plugins.messengerGroup.send(
    MESSENGER_METHODS.CHANGE_SETTINGS_RESPONSE,
    settings,
  );
};

const initWidget = context => (payload, req) => {
  req.answer(context.plugins.widget.mountSettings);
};

const logout = context => async (payload, req) => {
  try {
    const { authorize: authPlugin, messengerGroup } = context.plugins;
    const res = await authPlugin.logout();

    messengerGroup.send(MESSENGER_METHODS.DIALOG_CLOSE);
    messengerGroup.send(MESSENGER_METHODS.WIDGET_UNMOUNT);

    req.answer({
      status: res,
    });
  } catch (error) {
    throw ConnectError.createFromError(error, ERRORS.AUTH_LOGOUT);
  }
};

const unmountWidget = context => async () => {
  await context.plugins.widget.unmount();
  context.plugins.messengerGroup.removeMessenger(
    context.plugins.widget.messenger,
  );
};

const mountWidget = context => async () => {
  await context.plugins.widget.mount();
  context.plugins.messengerGroup.addMessenger(context.plugins.widget.messenger);
};

const mountWidgetOnAuth = context => options => {
  if (options === false) {
    return;
  }
  let timerId;

  const handler = async () => {
    clearTimeout(timerId);
    if (context.isLogin) {
      await mountWidget(context)();
      return;
    }
    timerId = setTimeout(handler, WIDGET_AUTH_TIMEOUT);
  };
  handler();
};

const initDialog = context => () => {
  const { dialog } = context.plugins;
  const handler = () => {
    dialog.mount();
    context.plugins.messengerGroup.addMessenger(dialog.messenger);
  };

  if (document.readyState !== 'complete') {
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'complete') {
        handler();
      }
    });
  } else {
    handler();
  }
};

export default {
  [PLUGIN_METHODS.CONTEXT_AUTHORIZE]: authorize,
  [MESSENGER_METHODS.LOGOUT_REQUEST]: logout,

  [MESSENGER_METHODS.WIDGET_INIT]: initWidget,
  [MESSENGER_METHODS.WIDGET_UNMOUNT]: unmountWidget,
  [PLUGIN_METHODS.CONTEXT_MOUNT_WIDGET_ON_AUTH]: mountWidgetOnAuth,
  [PLUGIN_METHODS.CONTEXT_MOUNT_WIDGET]: mountWidget,

  [MESSENGER_METHODS.INITIATE]: initiate,
  [PLUGIN_METHODS.CONTEXT_MOUNT_DIALOG]: initDialog,

  [MESSENGER_METHODS.CHANGE_SETTINGS_REQUEST]: changeSettings,
  [MESSENGER_METHODS.WIDGET_GET_SETTING]: widgetGetSettings,
  [PLUGIN_METHODS.CONTEXT_SET_PROVIDER_SETTINGS]: setProviderSettings,
};

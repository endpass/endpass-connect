interface InpageEvents {
  SETTINGS: 'INPAGE_PROVIDER_SETTINGS_EVENT',
  RESPONSE: 'INPAGE_PROVIDER_RESPONSE_EVENT',
  REQUEST: 'INPAGE_PROVIDER_REQUEST_EVENT',
  DROP_PENDING: 'INPAGE_PROVIDER_REQUEST_DROP_PENDING',
  LOGIN: 'INPAGE_PROVIDER_REQUEST_LOGIN',
  LOGGED_IN: 'INPAGE_PROVIDER_REQUEST_LOGGED_IN',
}

interface Web3Methods {
  ETH_ACCOUNTS: 'eth_accounts',
  ETH_COINBASE: 'eth_coinbase',
  ETH_UNINSTALL_FILTER: 'eth_uninstallFilter',
  NET_VERSION: 'net_version',
}

interface MessengerMethods {
  SIGN: 'SIGN',
  ACCOUNT: 'ACCOUNT',
  RECOVER: 'RECOVER',
  GET_SETTINGS: 'GET_SETTINGS',
  AUTH: 'AUTH',
  AUTH_STATUS: 'AUTH_STATUS',
  LOGOUT: 'LOGOUT',
  INITIATE: 'INITIATE',
  READY_STATE_BRIDGE: 'READY_STATE_BRIDGE',
  EXCHANGE_TOKEN_REQUEST: 'EXCHANGE_TOKEN_REQUEST',
  CREATE_DOCUMENT: 'CREATE_DOCUMENT',
  GENERATE_WALLET: 'GENERATE_WALLET',

  // DialogPlugin-level messages
  DIALOG_RESIZE: 'DIALOG_RESIZE',
  DIALOG_OPEN: 'DIALOG_OPEN',
  DIALOG_CLOSE: 'DIALOG_CLOSE',

  // Widget-level messages
  WIDGET_INIT: 'WIDGET_INIT',
  WIDGET_OPEN: 'WIDGET_OPEN',
  WIDGET_CLOSE: 'WIDGET_CLOSE',
  WIDGET_CHANGE_MOBILE_MODE: 'WIDGET_CHANGE_MOBILE_MODE',
  WIDGET_EXPAND_REQUEST: 'WIDGET_EXPAND_REQUEST',
  WIDGET_COLLAPSE_REQUEST: 'WIDGET_COLLAPSE_REQUEST',
  WIDGET_COLLAPSE_RESPONSE: 'WIDGET_COLLAPSE_RESPONSE',
  WIDGET_FIT: 'WIDGET_FIT',
  WIDGET_UNMOUNT: 'WIDGET_UNMOUNT',
  WIDGET_GET_SETTING: 'WIDGET_GET_SETTING',
  WIDGET_LOGOUT: 'WIDGET_LOGOUT',

  // Broadcast-level messages
  LOGOUT_REQUEST: 'LOGOUT_REQUEST',
  LOGOUT_RESPONSE: 'LOGOUT_RESPONSE',
  CHANGE_SETTINGS_REQUEST: 'CHANGE_SETTINGS_REQUEST',
  CHANGE_SETTINGS_RESPONSE: 'CHANGE_SETTINGS_RESPONSE',
}

interface PluginMethods {
  CONTEXT_AUTHORIZE: 'CONTEXT_AUTHORIZE',
  CONTEXT_SET_PROVIDER_SETTINGS: 'CONTEXT_SET_PROVIDER_SETTINGS',
  CONTEXT_MOUNT_DIALOG: 'CONTEXT_MOUNT_DIALOG',
  CONTEXT_MOUNT_WIDGET: 'CONTEXT_MOUNT_WIDGET',
  CONTEXT_CREATE_DOCUMENT: 'CONTEXT_CREATE_DOCUMENT',
  CONTEXT_OAUTH_AUTHORIZE: 'CONTEXT_OAUTH_AUTHORIZE',
}

interface Direction {
  AUTH: 'auth',
  WIDGET: 'widget',
  CONNECT: 'connect',
}

interface WidgetEvents {
  MOUNT: 'mount',
  DESTROY: 'destroy',
  OPEN: 'open',
  CLOSE: 'close',
  LOGOUT: 'logout',
  UPDATE: 'update',
}

interface DialogEvents {
  OPEN: 'open',
  CLOSE: 'close',
}

interface PluginNames {
  DIALOG: 'dialog',
  MESSENGER_GROUP: 'messengerGroup',
  WALLET: 'wallet',
  AUTHORIZE: 'authorize',
  DOCUMENT: 'document',
  OAUTH: 'oauth',
  PROVIDER: 'provider',
  WIDGET: 'widget',
  LOGIN_BUTTON: 'loginButton',
  CONNECT: 'connect',
}

declare module '@/constants' {
  const PLUGIN_NAMES: PluginNames;
  const DIALOG_EVENTS: DialogEvents;
  const WIDGET_EVENTS: WidgetEvents;
  const DIRECTION: Direction;
  const PLUGIN_METHODS: PluginMethods;
  const MESSENGER_METHODS: MessengerMethods;
  const WEB3_METHODS: Web3Methods;
  const INPAGE_EVENTS: InpageEvents;

  const DEFAULT_AUTH_URL: 'https://auth.endpass.com';
  const INPAGE_ID_PREFIX: 'ep_';

  const DAPP_WHITELISTED_METHODS: Array<
    'eth_sign' | 'personal_sign' | 'personal_ecRecover' | 'eth_personalSign' | 'eth_signTypedData' | 'eth_sendTransaction'
  >;

  type DAPP_BLACKLISTED_METHODS = [
    'personal_listAccounts',
    'personal_newAccount',
    'personal_unlockAccount',
    'personal_lockAccount',
    'personal_signTransaction',
    'eth_signTransaction',
    'personal_sendTransaction',
  ]
}

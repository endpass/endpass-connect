// @ts-check
export const DEFAULT_AUTH_URL = 'https://auth.endpass.com';

/**
 * Static things
 */
export const INPAGE_EVENTS = Object.freeze({
  SETTINGS: 'INPAGE_PROVIDER_SETTINGS_EVENT',
  RESPONSE: 'INPAGE_PROVIDER_RESPONSE_EVENT',
  REQUEST: 'INPAGE_PROVIDER_REQUEST_EVENT',
  DROP_PENDING: 'INPAGE_PROVIDER_REQUEST_DROP_PENDING',
  LOGIN: 'INPAGE_PROVIDER_REQUEST_LOGIN',
  LOGGED_IN: 'INPAGE_PROVIDER_REQUEST_LOGGED_IN',
});
export const INPAGE_ID_PREFIX = 'ep_';
export const DAPP_WHITELISTED_METHODS = [
  'eth_sign',
  'personal_sign',
  'personal_ecRecover',
  'eth_personalSign',
  'eth_signTypedData',
  'eth_sendTransaction',
];

export const DAPP_BLACKLISTED_METHODS = [
  'personal_listAccounts',
  'personal_newAccount',
  'personal_unlockAccount',
  'personal_lockAccount',
  'personal_signTransaction',
  'eth_signTransaction',
  'personal_sendTransaction',
];

export const WEB3_METHODS = Object.freeze({
  ETH_ACCOUNTS: 'eth_accounts',
  ETH_COINBASE: 'eth_coinbase',
  ETH_UNINSTALL_FILTER: 'eth_uninstallFilter',
  NET_VERSION: 'net_version',
});

export const MESSENGER_METHODS = Object.freeze({
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
});

export const PLUGIN_METHODS = {
  CONTEXT_AUTHORIZE: 'CONTEXT_AUTHORIZE',
  CONTEXT_SET_PROVIDER_SETTINGS: 'CONTEXT_SET_PROVIDER_SETTINGS',
  CONTEXT_MOUNT_DIALOG: 'CONTEXT_MOUNT_DIALOG',
  CONTEXT_MOUNT_WIDGET: 'CONTEXT_MOUNT_WIDGET',
  CONTEXT_CREATE_DOCUMENT: 'CONTEXT_CREATE_DOCUMENT',
  CONTEXT_OAUTH_AUTHORIZE: 'CONTEXT_OAUTH_AUTHORIZE',
};

export const DIRECTION = Object.freeze({
  AUTH: 'auth',
  WIDGET: 'widget',
  CONNECT: 'connect',
});

export const WIDGET_EVENTS = {
  MOUNT: 'mount',
  DESTROY: 'destroy',
  OPEN: 'open',
  CLOSE: 'close',
  LOGOUT: 'logout',
  UPDATE: 'update',
};

export const DIALOG_EVENTS = {
  OPEN: 'open',
  CLOSE: 'close',
};

export const PLUGIN_NAMES = {
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
};

export const CONTEXT = Symbol('context');

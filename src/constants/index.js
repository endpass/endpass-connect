/**
 * Networks map
 */
export const NETWORK_URL = Object.freeze({
  ETH: [
    // 'wss://eth-mainnet.endpass.com:2084',
    // 'wss://eth-mainnet.endpass.com',
    'https://eth-mainnet.endpass.com:2083',
    `https://mainnet.infura.io/${ENV.infura.key}`,
  ],
  ROP: [
    // 'wss://eth-ropsten.endpass.com:2084',
    // 'wss://eth-ropsten.endpass.com',
    'https://eth-ropsten.endpass.com:2083',
    `https://ropsten.infura.io/${ENV.infura.key}`,
  ],
  RIN: `https://rinkeby.infura.io/${ENV.infura.key}`,
  ETC: [
    // 'wss://etc-mainnet.endpass.com:2084',
    // 'wss://etc-mainnet.endpass.com',
    'https://etc-mainnet.endpass.com:2083',
    'https://etc-geth.0xinfra.com',
  ],
});

export const DEFAULT_NETWORKS = Object.freeze({
  1: {
    id: 1,
    networkType: 'main',
    currency: 1,
    name: 'Main',
    url: NETWORK_URL.ETH,
  },
  3: {
    id: 3,
    name: 'Ropsten',
    networkType: 'ropsten',
    currency: 2,
    url: NETWORK_URL.ROP,
  },
  4: {
    id: 4,
    name: 'Rinkeby',
    networkType: 'rinkeby',
    currency: 2,
    url: NETWORK_URL.RIN,
  },
  61: {
    id: 61,
    name: 'Ethereum classic',
    networkType: 'ethClassic',
    currency: 3,
    url: NETWORK_URL.ETC,
  },
});

/**
 * Static things
 */
export const INPAGE_EVENTS = {
  SETTINGS: 'INPAGE_PROVIDER_SETTINGS_EVENT',
  RESPONSE: 'INPAGE_PROVIDER_RESPONSE_EVENT',
  REQUEST: 'INPAGE_PROVIDER_REQUEST_EVENT',
};
export const INPAGE_ID_PREFIX = 'ep_';
export const HOST_WINDOW_NAME = 'endpass-connect-host';
export const DIALOG_WINDOW_NAME = 'endpass-connect-dialog';
export const STORAGE_USER_META_KEY = 'endpass-user-meta';
export const AVAILABLE_USER_META_PROPS = ['activeAccount'];
export const DAPP_WHITELISTED_METHODS = [
  'personal_sign',
  'personal_ecRecover',
  'eth_personalSign',
  'eth_signTypedData',
  'eth_sendTransaction',
];

export const METHODS = {
  AUTH: 'AUTH',
  SIGN: 'SIGN',
  LOGOUT: 'LOGOUT',
  RECOVER: 'RECOVER',
  GET_SETTINGS: 'GET_SETTINGS',
  READY_STATE_DIALOG: 'READY_STATE_DIALOG',
  READY_STATE_BRIDGE: 'READY_STATE_BRIDGE',
};

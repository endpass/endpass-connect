// @ts-check
export const DEFAULT_AUTH_URL = 'https://auth.endpass.com';

/**
 * @typedef {object} NET_ID - network id enum
 * @property {1} MAIN "Main network"
 * @property {3} ROPSTEN "Ropsten network"
 * @property {4} RINKEBY "Rinkeby network"
 * @property {61} ETHEREUM_CLASSIC "ETC network"
 */

/** @type {Readonly<NET_ID>} */
export const NET_ID = {
  MAIN: 1,
  ROPSTEN: 3,
  RINKEBY: 4,
  ETHEREUM_CLASSIC: 61,
};

/**
 * Networks map
 */
export const NETWORK_URL = Object.freeze({
  ETH: [
    // 'wss://eth-mainnet.endpass.com:2084',
    // 'wss://eth-mainnet.endpass.com',
    'https://eth-mainnet.endpass.com:2083',
    // @ts-ignore
    `https://mainnet.infura.io/${ENV.infura.key}`,
  ],
  ROP: [
    // 'wss://eth-ropsten.endpass.com:2084',
    // 'wss://eth-ropsten.endpass.com',
    'https://eth-ropsten.endpass.com:2083',
    // @ts-ignore
    `https://ropsten.infura.io/${ENV.infura.key}`,
  ],
  // @ts-ignore
  RIN: [`https://rinkeby.infura.io/${ENV.infura.key}`],
  ETC: [
    // 'wss://etc-mainnet.endpass.com:2084',
    // 'wss://etc-mainnet.endpass.com',
    'https://etc-mainnet.endpass.com:2083',
    'https://etc-geth.0xinfra.com',
  ],
});

// declare type DefaultNetworks = {
//   +[key: $Values<typeof NET_ID>]: { [string]: number },
// };

export const DEFAULT_NETWORKS = Object.freeze({
  [NET_ID.MAIN]: {
    id: NET_ID.MAIN,
    networkType: 'main',
    currency: 1,
    name: 'Main',
    url: NETWORK_URL.ETH,
  },
  [NET_ID.ROPSTEN]: {
    id: NET_ID.ROPSTEN,
    name: 'Ropsten',
    networkType: 'ropsten',
    currency: 2,
    url: NETWORK_URL.ROP,
  },
  [NET_ID.RINKEBY]: {
    id: NET_ID.RINKEBY,
    name: 'Rinkeby',
    networkType: 'rinkeby',
    currency: 2,
    url: NETWORK_URL.RIN,
  },
  [NET_ID.ETHEREUM_CLASSIC]: {
    id: NET_ID.ETHEREUM_CLASSIC,
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
  DROP_PENDING: 'INPAGE_PROVIDER_REQUEST_DROP_PENDING',
  LOGIN: 'INPAGE_PROVIDER_REQUEST_LOGIN',
  LOGGED_IN: 'INPAGE_PROVIDER_REQUEST_LOGGED_IN',
};
export const INPAGE_ID_PREFIX = 'ep_';
export const DAPP_WHITELISTED_METHODS = [
  'eth_sign',
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
  ACCOUNT: 'ACCOUNT',
  RECOVER: 'RECOVER',
  RESIZE_DIALOG: 'RESIZE_DIALOG',
  GET_SETTINGS: 'GET_SETTINGS',
  READY_STATE_DIALOG: 'READY_STATE_DIALOG',
  READY_STATE_BRIDGE: 'READY_STATE_BRIDGE',
};

// @ts-check

/**
 * @type {import('ConnectError').ERRORS}
 */
const ERRORS = {
  AUTH_CANCELED_BY_USER: 'AUTH_CANCELED_BY_USER',
  AUTH: 'AUTH',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  ACCOUNT_UPDATE: 'ACCOUNT_UPDATE',
  INITIALIZE: 'INITIALIZE',
  SIGN: 'SIGN',
  RECOVERY: 'RECOVERY',
  OAUTH_REQUIRE_ID: 'OAUTH_REQUIRE_ID',
  OAUTH_AUTHORIZE: 'OAUTH_AUTHORIZE',
  CREATE_DOCUMENT: 'CREATE_DOCUMENT',
  CREATE_WALLET: 'CREATE_WALLET',
  OAUTH_POPUP_CLOSED: 'OAUTH_POPUP_CLOSED',
  PROVIDER: 'PROVIDER',
  NOT_DEFINED: 'NOT_DEFINED',
};

const ERRORS_TITLE = {
  AUTH_CANCELED_BY_USER: 'Authentication cancelled by user',
  AUTH: 'Authentication Error!',
  AUTH_LOGOUT: 'Logout Error!',
  ACCOUNT_UPDATE: 'Account updating failed!',
  INITIALIZE: 'Initialize failed!',
  SIGN: 'Sign Error!',
  RECOVERY: 'Recovery Error!',
  OAUTH_REQUIRE_ID: 'Connect library requires OAuth client id!',
  OAUTH_AUTHORIZE: 'Authorization failed',
  CREATE_DOCUMENT: 'Document creation error',
  CREATE_WALLET: 'Wallet creation error',
  OAUTH_POPUP_CLOSED: 'The popup was closed',
  PROVIDER:
    'Something is wrong with the provider, maybe the provider is not installed in the web3 instance',
  NOT_DEFINED: 'Endpass connect not defined error',
};

/**
 * @typedef {import('ConnectError').ERROR_VALUES} ERROR_VALUES
 */

export default class ConnectError extends Error {
  /**
   * @param {string=} message
   * @param {ERROR_VALUES=} code
   */
  constructor(message, code = ERRORS.NOT_DEFINED) {
    super(message);
    this.stack = new Error().stack;
    this.code = code;
  }

  /**
   *
   * @param {ERROR_VALUES} code
   * @param {string=} message
   * @return {ConnectError}
   */
  static create(code, message) {
    const errorMessage =
      message || ERRORS_TITLE[code] || ERRORS_TITLE.NOT_DEFINED;
    const error = new ConnectError(errorMessage, code);
    return error;
  }

  /**
   * @param {Error|ConnectError|{ message: string, code?: string } | ?} error
   * @param {ERROR_VALUES} defaultCode
   * @return {ConnectError}
   */
  static createFromError(error, defaultCode = ERRORS.NOT_DEFINED) {
    if (!error) {
      return ConnectError.create(defaultCode);
    }

    if (error instanceof ConnectError) {
      return error;
    }

    if (error.constructor.name === 'ConnectError') {
      // @ts-ignore
      return new ConnectError(error.message, error.code);
    }

    if (error instanceof Error) {
      const resError = ConnectError.create(defaultCode, error.message);
      resError.stack = error.stack;
      return resError;
    }

    return ConnectError.create(defaultCode);
  }

  static get ERRORS() {
    return ERRORS;
  }
}

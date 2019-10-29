export type ERRORS = {
  AUTH_CANCELED_BY_USER: 'AUTH_CANCELED_BY_USER';
  AUTH: 'AUTH';
  AUTH_LOGOUT: 'AUTH_LOGOUT';
  ACCOUNT_UPDATE: 'ACCOUNT_UPDATE';
  INITIALIZE: 'INITIALIZE';
  SIGN: 'SIGN';
  RECOVERY: 'RECOVERY';
  OAUTH_REQUIRE_ID: 'OAUTH_REQUIRE_ID';
  OAUTH_AUTHORIZE: 'OAUTH_AUTHORIZE';
  CREATE_DOCUMENT: 'CREATE_DOCUMENT';
  CREATE_WALLET: 'CREATE_WALLET';
  OAUTH_POPUP_CLOSED: 'OAUTH_POPUP_CLOSED';
  PROVIDER: 'PROVIDER';
  NOT_DEFINED: 'NOT_DEFINED';
};

export declare type ERROR_VALUES = ERRORS[keyof ERRORS];

declare class ConnectError {
  constructor(message?: string, code?: ERROR_VALUES);

  code: ERROR_VALUES;

  static create(code: ERROR_VALUES, message?: string): ConnectError;

  static createFromError(error: Error, defaultCode: ERROR_VALUES): ConnectError;

  static get ERRORS(): ERRORS;
}

export default ConnectError;

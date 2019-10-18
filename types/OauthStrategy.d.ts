type StrategyParams = {
  // eslint-disable-next-line camelcase
  client_id: string,
  scope: string,
};

declare type OauthStrategy = {
  getTokenObject: (code: string, params: StrategyParams) => TokenObject,
  init: (oauthServer: string, params: StrategyParams) => void,
  [key: string]: any,
};

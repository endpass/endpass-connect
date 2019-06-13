type StrategyParams = {
  client_id: string,
  scope: string,
};

declare type OauthStrategy = {
  getTokenObject: (oauthUrl: string, params: StrategyParams, popupOptions: object) => TokenObject,
  [key: string]: any,
};

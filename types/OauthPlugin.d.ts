declare type OauthPlugin = import('@/plugins/OauthPlugin/OauthPlugin').default;

declare type OauthPluginOptions = {
  clientId: string;
  oauthServer: string;
  isPopup?: boolean;
  scopes: string[];
};

declare type OauthOptionsWithStrategy = {
  scopes?: string[];
  clientId: string;
  oauthServer: string;
  oauthStrategy: import('@/plugins/OauthPlugin/Oauth/OauthPkceStrategy').default;
  frameStrategy: import('@/plugins/OauthPlugin/FrameStrategy').default;
};

declare type OauthRequestOptions = import('axios').AxiosRequestConfig & {
  scopes?: string[];
};

declare type OauthHandlers = typeof import('@/plugins/OauthPlugin/oauthHandlers.js').default;
declare type OauthResizeFrameEventPayload = {
  offsetHeight: number;
} & RequestEventPayload;

declare type OauthResizeFrameEventHandler = (
  payload: OauthResizeFrameEventPayload,
  req: OriginReq,
) => void;

declare type OauthPlugin = import('@/plugins/OauthPlugin/OauthPlugin').default;
declare type OauthOptions = {
  scopes?: string[],
  url?: string,
}

declare type OauthOptionsWithStrategy = OauthOptions & {
  clientId: string,
  oauthServer: string,
  oauthStrategy: import('@/plugins/OauthPlugin/Oauth/OauthPkceStrategy').default,
  frameStrategy: import('@/plugins/OauthPlugin/FrameStrategy').default,
}

declare type OauthRequestOptions = import('axios').AxiosRequestConfig & {
  scopes?: string[]
}

declare type OauthHandlers = typeof import('@/plugins/OauthPlugin/oauthHandlers.js').default;
declare type OauthResizeFrameEventPayload = {
  offsetHeight: number,
} & RequestEventPayload;

declare type OauthResizeFrameEventHandler = (
  payload: OauthResizeFrameEventPayload, req: OriginReq
) => void;
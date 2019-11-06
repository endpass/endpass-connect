/// <reference path="constants.d.ts" />

declare type ContextPlugins = {
  [key in PluginNames[keyof PluginNames]]: () => {}
}

declare type ConnectPlugin = typeof import('@/plugins/PluginBase');

// OAuth Plugin
declare type OauthPlugin = import('@/plugins/OauthPlugin/OauthPlugin').default;
declare type OauthOptions = {
  clientId: string,
  scopes: string[],
  oauthServer: string,
  oauthStrategy: import('@/plugins/OauthPlugin/Oauth/OauthPkceStrategy').default,
  frameStrategy: import('@/plugins/OauthPlugin/FrameStrategy').default,
}
declare type OauthHandlers = typeof import('@/plugins/OauthPlugin/oauthHandlers.js').default;
declare type OauthResizeFrameEventPayload = {
  offsetHeight: number,
} & RequestEventPayload;
declare type OauthResizeFrameEventHandler = (
  payload: OauthResizeFrameEventPayload, req: OriginReq
) => void;
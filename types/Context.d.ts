declare type Context = import('@/class/Context').default;

declare type ContextOptions = {
  oauthClientId: string,
  oauthServer: string,
  oauthPopup?: boolean,
  plugins?: Array<ConnectPlugin>,
  authUrl?: string,
  namespace?: string,
  isIdentityMode?: boolean,
  widget?: {
    position?: object,
  },
  url: string,
  scopes: string[],
}
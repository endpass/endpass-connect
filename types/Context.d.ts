declare type Context = import('@/class/Context').default;

declare type ContextOptions = {
  oauthClientId: string,
  plugins?: ConnectPlugin[],

  oauthServer: string,
  widget?: {
    position?: object,
  } | false,
  isIdentityMode: boolean,
}
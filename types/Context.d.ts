declare type Context = import('@/class/Context').default;

declare type ContextOptions = {
  oauthClientId: string,
  plugins?: ConnectPlugin[],
}
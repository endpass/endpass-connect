declare type Context = import('@/class/Context').default;

declare type ContextOptions = {
  clientId: string;
  plugins?: ConnectPlugin[];

  oauthServer: string;
  widget?:
    | {
        position?: object;
      }
    | false;
  isIdentityMode: boolean;
};

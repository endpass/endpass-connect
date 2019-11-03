declare namespace ENV {
  const oauthServer: string;
  const isProduction: boolean;
  const apiServer: string;
}

declare type Listener = (...args: any) => void

declare module '@endpass/class/LocalStorage' {
  function remove(key: string): void;
  function save(key: string, data: any): void;
  function load(key: string): any;
}

declare type OriginReq = {
  method: string,
  answer: Function,
  source?: string,
}

declare type ContextCarrier = Function & {
  options: ContextOptions,
  executeMethod: Function,
  plugins: ContextPlugins,
}

declare type ContextPayload = {
  [key: string]: any,
}

declare type ContextHandler = (payload: ContextPayload, req: OriginReq) => void;

declare type ConnectPlugin = typeof import('@/plugins/PluginBase');

declare type ContextOptions = {
  oauthClientId: string,
  plugins?: Array<ConnectPlugin>,
  authUrl?: string,
  namespace?: string,
  isIdentityMode?: boolean,
  widget: {
    position: object,
  },
}

declare type ContextError = {
  code: number,
}

declare type EventResult = {
  status: boolean,
  error: NodeJS.ErrnoException | Error,
  code: keyof import('ConnectError').ERRORS,
}

declare type ContextHandlers = {
  [key: string]: Function,
}

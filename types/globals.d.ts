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

declare type Token = string;

declare type OriginReq = {
  method: string,
  answer: Function,
  source?: string,
}

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

declare type RequestEventPayload = {
  [key: string]: any,
}


declare type RequestEventHandlers = {
  [key: string]: RequestEventHandler,
}

declare type OauthHandlers = typeof import('@/plugins/OauthPlugin/oauthHandlers.js').default;

declare type Context = typeof import('@/class/Context').default;

declare type RequestEventHandler = (payload: RequestEventPayload, req: OriginReq) => void;


declare type OauthResizeFrameEventPayload = {
  offsetHeight: number,
} & RequestEventPayload;

declare type OauthResizeFrameEventHandler = (payload: OauthResizeFrameEventPayload, req: OriginReq) => void;



declare type ConnectErrors = import('ConnectError').ERRORS;

declare type EventResult = {
  status: boolean,
  error: Error, // & { code?: number }
  code: ConnectErrors[keyof ConnectErrors]
}



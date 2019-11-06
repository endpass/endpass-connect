declare interface Context {
  new (options: ContextOptions, ClassPlugin: ConnectPlugin): Context;

  options: ContextOptions;
  contextHandlers: RequestEventHandlers;

  // TODO type it after @ts-ignore in the Context.js will be removed
  plugins: { [key: string]: any };

  readonly isLogin: boolean;
  ask: (method: string, payload: any) => Promise<any>;
  handleEvent: (payload: any, originReq: OriginReq) => Promise<void>;
  executeMethod: (method: string, payload?: any) => Promise<any>;
}


/// <reference path="constants.d.ts" />

declare type OriginReq = {
  method: string,
  answer: Function,
  source?: string,
}

declare type RequestEventPayload = {
  [key: string]: any,
}

declare type RequestEventHandler = (payload: RequestEventPayload, req: OriginReq) => void;
declare type RequestEventHandlers = {
  [key: string]: RequestEventHandler,
}

declare type ConnectErrors = import('ConnectError').ERRORS;

declare type EventResult = {
  status: boolean,
  error: Error,
  code: ConnectErrors[keyof ConnectErrors]
}

declare type RequestMethods = PluginMethods & MessengerMethods & Web3Methods & InpageEvents;
declare type RequestMethodsValues = RequestMethods[keyof RequestMethods];
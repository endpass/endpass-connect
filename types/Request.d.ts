/// <reference path="constants.d.ts" />

declare type OriginReq = {
  method: string;
  answer: Function;
  source?: ContextWindow;
};

declare type RequestEventPayload = {
  [key: string]: any;
};

declare type RequestEventHandler = (
  payload: RequestEventPayload,
  req: OriginReq,
) => void;
declare type RequestEventHandlers = {
  [key: string]: RequestEventHandler;
};

declare type EventResult = {
  status: boolean;
  error: Error;
  code: import('ConnectError').ERROR_VALUES;
};

declare type RequestMethods = PluginMethods &
  MessengerMethods &
  Web3Methods &
  InpageEvents;
declare type RequestMethodsValues = RequestMethods[keyof RequestMethods];

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
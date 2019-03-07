// @flow

declare type RpcVersion = '2.0';
declare type RpcId = string | number;

declare type RpcRequest = {
  jsonrpc: RpcVersion,
  id: RpcId,
  method: string,
  params?: Array<any>,
};

declare type RpcSuccessResponse = {
  jsonrpc: RpcVersion,
  id: RpcId,
  result: any,
};

declare type RpcErrorResponse = {
  jsonrpc: RpcVersion,
  id: RpcId,
  error: string,
};

declare type RpcSubscriptionResponse = {
  jsonrpc: RpcVersion,
  id: RpcId,
  method: 'eth_subscription',
  params: {
    subscription: string,
    result: any,
  },
};

declare type RpcResponse =
  | RpcSuccessResponse
  | RpcErrorResponse
  | RpcSubscriptionResponse;

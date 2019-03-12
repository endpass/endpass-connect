import { JsonRPCRequest } from 'web3/providers';
import { Overwrite } from 'utility-types';

declare type RpcVersion = '2.0';
declare type RpcId = string | number;

declare type RpcRequestExt = {
  jsonrpc: RpcVersion,
  id: RpcId,
};

export declare type RpcRequest = Overwrite<JsonRPCRequest, RpcRequestExt>;

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

export declare type RpcResponse =
  | RpcSuccessResponse
  | RpcErrorResponse
  | RpcSubscriptionResponse
  | null;

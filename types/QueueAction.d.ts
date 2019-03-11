import { $Values } from 'utility-types';
import itemStates from '@/Queue/itemStates';
import { RpcRequest, RpcResponse } from '@/types/json-rpc';
import { UserSettings } from '@/types/UserSettings';

type ItemState = $Values<typeof itemStates>;

export declare type QueueAction = {
  request: RpcRequest,
  state: ItemState,
  payload?: RpcResponse,
  settings: UserSettings,
  end: () => void,
  setState(param: ItemState): void,
  setPayload(payload: any): void,
};

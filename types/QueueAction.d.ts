import { $Values } from 'utility-types';
import actionState from '@/streams/inpageProvider/actionState';
import { RpcRequest, RpcResponse } from '@/types/json-rpc';
import { UserSettings } from '@/types/UserSettings';

type ActionState = $Values<typeof actionState>;

declare type QueueAction = {
  request: RpcRequest;
  state: ActionState;
  payload?: RpcResponse;
  settings: UserSettings;
  end: () => void;
  setState(param: ActionState): void;
  setPayload(payload: any): void;
};

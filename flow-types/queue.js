// @flow
import itemStates from '../src/Queue/itemStates';

type ItemState = $Values<typeof itemStates>;

declare type QueueItem = {|
  request: RpcRequest,
  state: ItemState,
  payload: ?RpcResponse,
  settings: UserSettings,
  end: () => void,
  setState: (param: ItemState) => void,
  setPayload: (payload: any) => void,
|};

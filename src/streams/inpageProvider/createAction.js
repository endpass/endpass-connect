import itemStates from './actionState';

export default function createAction(request, settings) {
  if (!request.id) return null;

  /** @type import('@/types/QueueAction').QueueAction */
  const action = {
    /* eslint-disable-next-line */
    request: /** @type {RpcRequest} */ (request),
    state: itemStates.INITIAL,
    payload: null,
    settings,
    end() {
      this.setState(itemStates.END);
    },
    setPayload(res) {
      this.payload = res;
    },
    setState(state) {
      this.state = state;
    },
  };
  return action;
}

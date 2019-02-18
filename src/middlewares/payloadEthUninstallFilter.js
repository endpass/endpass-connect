import { INPAGE_EVENTS } from '../constants';
import itemStates from '@/Queue/itemStates';

export default function(context, item) {
  const { request, payload } = item;

  if (request.method === 'eth_uninstallFilter') {
    item.setState(itemStates.END);
    context.getEmitter().emit(INPAGE_EVENTS.DROP, { ...payload, result: true });
  }
}

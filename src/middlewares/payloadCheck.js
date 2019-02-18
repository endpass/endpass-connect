import { INPAGE_EVENTS } from '../constants';
import itemStates from '@/Queue/itemStates';

export default function(context, item) {
  const { payload } = item;

  if (payload.result) {
    item.setState(itemStates.END);
    context.getEmitter().emit(INPAGE_EVENTS.RESPONSE, payload);
  }
}

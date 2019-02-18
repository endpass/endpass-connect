import processPayload from '@/util/processPayload';
import { INPAGE_EVENTS } from '@/constants';
import itemStates from '@/Queue/itemStates';

export default function(context, item) {
  const { request } = item;
  const payload = processPayload(request, context.getProviderSettings());

  item.setPayload(payload);

  if (payload.result) {
    item.setState(itemStates.END);
    context.getEmitter().emit(INPAGE_EVENTS.RESPONSE, payload);
  }
}

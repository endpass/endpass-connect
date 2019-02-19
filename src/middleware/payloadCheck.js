import { INPAGE_EVENTS } from '@/constants';

export default function(context, item) {
  const { payload } = item;

  if (payload.result) {
    item.end();
    context.getEmitter().emit(INPAGE_EVENTS.RESPONSE, payload);
  }
}

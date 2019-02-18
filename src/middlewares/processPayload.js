import { processPayload } from '@/class';
import { INPAGE_EVENTS } from '../constants';

export default function(context, item) {
  const { request } = item;
  const payload = processPayload(request, context.getProviderSettings());

  item.setPayload(payload);

  if (payload.result || request.method === 'eth_uninstallFilter') {
    item.finish();
    context.getEmitter().emit(INPAGE_EVENTS.RESPONSE, payload);
  }
}

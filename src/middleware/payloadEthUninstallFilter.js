import { INPAGE_EVENTS } from '@/constants';

export default function(context, item) {
  const { request, payload = {} } = item;

  if (request.method === 'eth_uninstallFilter') {
    item.end();
    context
      .getEmitter()
      .emit(INPAGE_EVENTS.DROP_PENDING, { ...payload, result: true });
  }
}

import { INPAGE_EVENTS } from '@/constants';

/** @type {import("@/types/Middleware").Middleware} */
export default function(context, action) {
  const { request, payload = {} } = action;

  if (request.method === 'eth_uninstallFilter') {
    context
      .getEmitter()
      .emit(INPAGE_EVENTS.DROP_PENDING, { ...payload, result: true });
  }
}

import { INPAGE_EVENTS, WEB3_METHODS } from '@/constants';

/** @type {import("@/types/Middleware").Middleware} */
export default async function(context, action) {
  const { request, payload = {} } = action;

  if (request.method === WEB3_METHODS.ETH_UNINSTALL_FILTER) {
    context
      .getEmitter()
      .emit(INPAGE_EVENTS.DROP_PENDING, { ...payload, result: true });
  }
}

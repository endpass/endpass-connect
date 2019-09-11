import { INPAGE_EVENTS, WEB3_METHODS } from '@/constants';

/** @type {import("@/types/Middleware").Middleware} */
export default async function({ action, providerPlugin }) {
  const { request, payload = {} } = action;

  if (request.method === WEB3_METHODS.ETH_UNINSTALL_FILTER) {
    providerPlugin.emitter.emit(INPAGE_EVENTS.DROP_PENDING, {
      ...payload,
      result: true,
    });
  }
}

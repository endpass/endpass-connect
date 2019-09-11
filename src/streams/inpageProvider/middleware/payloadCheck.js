import { INPAGE_EVENTS } from '@/constants';

/** @type {import("@/types/Middleware").Middleware} */
export default async function({ action, providerPlugin }) {
  const { payload } = action;

  if (payload && payload.result) {
    action.end();
    providerPlugin.emitter.emit(INPAGE_EVENTS.RESPONSE, payload);
  }
}

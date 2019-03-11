import { INPAGE_EVENTS } from '@/constants';

/** @type {import("@/types/Middleware").Middleware} */
export default function(context, action) {
  const { payload } = action;

  if (payload && payload.result) {
    action.end();
    context.getEmitter().emit(INPAGE_EVENTS.RESPONSE, payload);
  }
}

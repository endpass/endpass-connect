import processPayload from '@/util/processPayload';

/** @type {import("@/types/Middleware").Middleware} */
export default async function({ action }) {
  const { request } = action;
  const payload = processPayload(request, action.settings);

  if (payload && payload.result) {
    action.setPayload(payload);
  }
}

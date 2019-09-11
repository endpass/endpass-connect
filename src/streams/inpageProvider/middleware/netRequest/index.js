import RequestProcess from './RequestProcess';

/** @type {import("@/types/Middleware").Middleware} */
export default async function({ context, action, providerPlugin }) {
  const { request, settings } = action;
  const netRequest = new RequestProcess({
    context,
    request,
    settings,
    providerPlugin,
  });
  await netRequest.start();
}

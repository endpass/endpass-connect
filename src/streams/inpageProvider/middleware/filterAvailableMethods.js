// @ts-check
import { INPAGE_EVENTS, DAPP_BLACKLISTED_METHODS } from '@/constants';

/** @type {import("@/types/Middleware").Middleware} */
export default async function({ action, providerPlugin }) {
  const { request } = action;

  if (!request) return;

  const { method } = request;

  if (!method || !DAPP_BLACKLISTED_METHODS.includes(method)) return;

  const response = {
    id: request.id,
    jsonrpc: request.jsonrpc,
    error: {
      code: -32601,
      message: `Endpass connect - RPC Error: The method ${method} does not exist/is not available`,
    },
  };
  action.end();

  providerPlugin.emitter.emit(INPAGE_EVENTS.RESPONSE, response);
}

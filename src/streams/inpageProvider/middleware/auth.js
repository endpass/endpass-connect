// @ts-check

import { PLUGIN_METHODS, WEB3_METHODS } from '@/constants';

/** @type {import("@/types/Middleware").Middleware} */
export default async function(context, action) {
  const { request } = action;

  if (request.method === WEB3_METHODS.ETH_ACCOUNTS && !context.isLogin) {
    await context.handleRequest(PLUGIN_METHODS.CONTEXT_SERVER_AUTH);
  }
}

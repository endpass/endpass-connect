// @ts-check

import { WEB3_METHODS } from '@/constants';

/** @type {import("@/types/Middleware").Middleware} */
export default async function({ context, action, providerPlugin }) {
  const { request } = action;

  if (request.method === WEB3_METHODS.ETH_ACCOUNTS && !context.isLogin) {
    await providerPlugin.serverAuth();
  }
}

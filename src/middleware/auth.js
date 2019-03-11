// @ts-check

/** @type {import("@/types/Middleware").Middleware} */
export default async function(context, action) {
  const { request } = action;

  if (request.method === 'eth_accounts' && !context.isLogin()) {
    await context.serverAuth();
  }
}

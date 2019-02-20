export default async function(context, item) {
  const { request } = item;

  if (request.method === 'eth_accounts' && !context.isLogin()) {
    await context.serverAuth();
  }
}

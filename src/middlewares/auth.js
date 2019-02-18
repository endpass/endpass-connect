import get from 'lodash/get';

export default async function(context, item) {
  const req = item.request;
  const result = get(item, 'payload.result');

  if (req.method == 'net_version' && !result) {
    await context.auth();
    item.repeat();
  }
}

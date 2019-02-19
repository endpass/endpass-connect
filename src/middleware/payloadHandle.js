import processPayload from '@/util/processPayload';

export default function(context, item) {
  const { request } = item;
  const payload = processPayload(request, context.getProviderSettings());

  if (payload.result) {
    item.setPayload(payload);
  }
}

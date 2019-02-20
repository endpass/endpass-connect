import processPayload from '@/util/processPayload';

export default function(context, item) {
  const { request } = item;
  const payload = processPayload(request, item.settings);

  if (payload && payload.result) {
    item.setPayload(payload);
  }
}

import RequestProcess from './RequestProcess';

export default async function(context, item) {
  const { request, settings } = item;
  const netRequest = new RequestProcess({ context, request, settings });
  await netRequest.start();
}

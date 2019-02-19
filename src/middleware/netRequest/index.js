import RequestProcess from './RequestProcess';

export default async function(context, item) {
  const netRequest = new RequestProcess(context, item.request);
  await netRequest.start();
}

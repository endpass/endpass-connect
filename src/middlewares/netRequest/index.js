import RequestProcess from './RequestProcess';

export default async function(context, item) {
  const req = item.payload;

  const netRequest = new RequestProcess(context, req);
  await netRequest.doProcess();
}

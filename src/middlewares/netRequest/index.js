import RequestProcess from './RequestProcess';

export default async function(context, queue) {
  const req = queue[0];
  const netRequest = new RequestProcess(context, req);
  await netRequest.doProcess();
  queue.shift();
}

import RequestProcess from './RequestProcess';
import itemStates from '@/Queue/itemStates';

export default async function(context, item) {
  if (item.state !== itemStates.END) {
    const netRequest = new RequestProcess(context, item.request);
    await netRequest.doProcess();
  }
}

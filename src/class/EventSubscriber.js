export default class EventSubscriber {
  static subscribe(context) {
    this.context = context;
    const handler = (payload, req) => {
      context.handleEvent(payload, req);
    };
    context.subscribeData.forEach(([messenger]) => {
      messenger.subscribe(handler);
    });
  }
}

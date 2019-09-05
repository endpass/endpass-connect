import mapValues from 'lodash.mapvalues';

export default class HandlersFactory {
  static createHandlers(ctx, handlers) {
    return mapValues(handlers, method => method(ctx));
  }

  static createHandleEvent(ctx, handlers) {
    const handlersEvent = HandlersFactory.createHandlers(ctx, handlers);
    return (payload, req) => {
      if (!handlersEvent[req.method]) {
        return;
      }
      handlersEvent[req.method](payload, req);
    };
  }
}

import mapValues from 'lodash.mapvalues';

export default class HandlersFactory {
  static createHandlers(self, handlers) {
    return mapValues(handlers, method => method(self));
  }

  static createHandleEvent(ctx, handlers) {
    const handlersEvent = HandlersFactory.createHandlers(ctx, handlers);
    return (payload, req) => {
      if (!handlersEvent[req.method]) {
        return null;
      }
      return handlersEvent[req.method](payload, req);
    };
  }
}

export default class HandlersFactory {
  static createHandlers(self, handlersMap) {
    return Object.keys(handlersMap).reduce((selfHandlersMap, handlerKey) => {
      return {
        ...selfHandlersMap,
        [handlerKey]: handlersMap[handlerKey](self),
      };
    }, {});
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

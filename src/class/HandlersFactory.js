export default class HandlersFactory {
  static createHandlers(self, handlersMap) {
    return Object.keys(handlersMap).reduce(
      (selfHandlersMap, handlerKey) => ({
        ...selfHandlersMap,
        [handlerKey]: handlersMap[handlerKey](self),
      }),
      {},
    );
  }
}

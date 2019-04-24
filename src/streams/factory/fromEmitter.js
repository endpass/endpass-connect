const fromEmitter = (emitter, name) => (start, sink) => {
  if (start !== 0) return;
  const handler = ev => sink(1, ev);
  sink(0, t => {
    if (t === 2)
      emitter.unsubscribe
        ? emitter.unsubscribe(name, handler)
        : emitter.off(name, handler);
  });
  emitter.subscribe
    ? emitter.subscribe(name, handler)
    : emitter.on(name, handler);
};

export default fromEmitter;

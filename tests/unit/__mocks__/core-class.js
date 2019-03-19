jest.mock('@endpass/class', () => {
  const classes = require.requireActual('@endpass/class');
  function CrossWindowMessenger() {}
  const p = CrossWindowMessenger.prototype;
  p.subscribe = jest.fn();
  p.setTarget = jest.fn();
  p.send = jest.fn();
  p.sendAndWaitResponse = jest.fn();

  return {
    ...classes,
    CrossWindowMessenger,
  };
});

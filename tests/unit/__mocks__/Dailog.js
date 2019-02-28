jest.mock('@/class/Dialog', () => {
  return jest.fn().mockImplementation(() => {
    return {
      open: jest.fn(),
      close: jest.fn(),
      ask: jest.fn(),
      awaitMessage: jest.fn(),
      sendMessage: jest.fn(),
    };
  });
});

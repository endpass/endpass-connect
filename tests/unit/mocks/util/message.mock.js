jest.mock('@@/util/message', () => ({
  sendMessage: jest.fn(),
  sendMessageToDialog: jest.fn(),
  sendMessageToOpener: jest.fn(),
  awaitMessageFromOpener: jest.fn(),
  awaitDialogMessage: jest.fn(),
}));

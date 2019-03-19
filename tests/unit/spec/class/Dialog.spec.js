import Dialog from '@/class/Dialog';
import { METHODS } from '@/constants';

describe('Dialog class', () => {
  const messenger = {
    send: jest.fn(),
    sendAndWaitResponse: jest.fn(),
    setTarget: jest.fn(),
    subscribe: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create params for open dialog', () => {
    const params = Dialog.createParams({
      method: 'method',
      payload: 'payload',
      otherField: 'otherField',
    });

    expect(params).toEqual({
      method: 'method',
      route: '',
      payload: 'payload',
    });
  });

  it('should open dialog', async () => {
    expect.assertions(2);

    messenger.sendAndWaitResponse = jest.fn().mockResolvedValueOnce({
      status: true,
    });

    const instance = new Dialog({
      context: {
        getMessenger: () => messenger,
        getNamespace() {},
      },
    });

    const passData = { passData: 'passData' };

    await instance.open(passData);

    expect(messenger.sendAndWaitResponse).toBeCalledWith(METHODS.DIALOG_OPEN, passData);
    expect(messenger.send).not.toBeCalledWith(METHODS.DIALOG_CLOSE);
  });

  it('should not open dialog', async () => {
    expect.assertions(3);

    messenger.sendAndWaitResponse = jest.fn().mockResolvedValueOnce({
      status: false,
      error: 'fail',
    });

    const instance = new Dialog({
      context: {
        getMessenger: () => messenger,
        getNamespace() {},
      },
    });

    const passData = { passData: 'passData' };

    const err = new Error('fail');
    let check;
    try {
      await instance.open(passData);
    } catch (e) {
      check = e;
    }

    expect(messenger.sendAndWaitResponse).toBeCalledWith(METHODS.DIALOG_OPEN, passData);
    expect(messenger.send).toBeCalledWith(METHODS.DIALOG_CLOSE);
    expect(check).toEqual(err);
  });
});

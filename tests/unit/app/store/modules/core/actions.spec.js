import { sendMessageToOpener } from '@@/util/message';
import coreActions from '@@/app/src/store/modules/core/actions';
import { METHODS } from '@@/constants';

describe('core actions', () => {
  let dispatch;

  beforeEach(() => {
    jest.clearAllMocks();

    dispatch = jest.fn();
  });

  describe('sendDialogMessage', () => {
    it('should send message with given data', async () => {
      expect.assertions(1);

      const data = {
        foo: 'bar',
      };

      await coreActions.sendDialogMessage(null, data);

      expect(sendMessageToOpener).toBeCalledWith('dialog', data);
    });
  });

  describe('sendReadyMessage', () => {
    it('should send message of application ready', async () => {
      expect.assertions(1);

      await coreActions.sendReadyMessage({ dispatch });

      expect(dispatch).toBeCalledWith('sendDialogMessage', {
        method: METHODS.READY_STATE_DIALOG,
        status: true,
      });
    });
  });

  describe('closeDialog', () => {
    it('should close window', async () => {
      expect.assertions(1);

      jest.spyOn(window, 'close');

      await coreActions.closeDialog();

      expect(window.close).toBeCalled();
    });
  });
});

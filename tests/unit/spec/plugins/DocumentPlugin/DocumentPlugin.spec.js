import { DocumentPlugin } from '@/plugins/DocumentPlugin';
import { MESSENGER_METHODS } from '@/constants';

describe('Document plugin', () => {
  let plugin;
  const options = {};
  const docId = 'docId';

  const context = {
    ask: jest.fn(),
    executeMethod: jest.fn(),
    isLogin: true,
  };

  const createPlugin = () => {
    const inst = new DocumentPlugin(options, context);
    inst.init();
    return inst;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    plugin = createPlugin();
  });

  describe('initial', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create instance of plugin', () => {
      expect(plugin).toBeInstanceOf(DocumentPlugin);
    });
  });

  describe('createDocument', () => {
    it('should create document and return id', async () => {
      expect.assertions(2);

      context.ask = jest.fn().mockResolvedValueOnce({
        status: true,
        payload: {
          id: docId,
        },
      });

      const res = await plugin.createDocument();

      expect(res).toEqual({
        id: docId,
      });

      expect(context.ask).toBeCalledWith(MESSENGER_METHODS.CREATE_DOCUMENT, undefined);
    });

    it('should pass params for create document and return id', async () => {
      expect.assertions(2);

      context.ask = jest.fn().mockResolvedValueOnce({
        status: true,
        payload: {
          id: docId,
        },
      });

      const params = {
        defaultDocumentType: 'Passport',
      };

      const res = await plugin.createDocument(params);

      expect(res).toEqual({
        id: docId,
      });

      expect(context.ask).toBeCalledWith(
        MESSENGER_METHODS.CREATE_DOCUMENT,
        params,
      );
    });

    it('should throw error for create document', async () => {
      expect.assertions(2);

      context.ask = jest.fn().mockResolvedValueOnce({
        status: false,
      });

      try {
        await plugin.createDocument();
      } catch (e) {
        expect(e).toEqual(new Error('Document creation error'));
      }

      expect(context.ask).toBeCalledWith(MESSENGER_METHODS.CREATE_DOCUMENT, undefined);
    });
  });
});

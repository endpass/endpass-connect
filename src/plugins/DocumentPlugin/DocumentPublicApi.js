import { MESSENGER_METHODS } from '@/constants';

export default documentPlugin => ({
  createDocument(params) {
    return documentPlugin.context.ask(
      MESSENGER_METHODS.CREATE_DOCUMENT,
      params,
    );
  },
});

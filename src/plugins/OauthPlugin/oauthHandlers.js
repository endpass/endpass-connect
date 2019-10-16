import { MESSENGER_METHODS } from '@/constants';

const resize = plugin => payload => {
  console.log('-- resize oauthHandlers', payload);
  plugin.iframeStrategy.resize(payload);
};

export default {
  [MESSENGER_METHODS.DIALOG_RESIZE]: resize,
};

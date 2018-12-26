import get from 'lodash/get';

export const sendMessage = ({ target, meta = {}, payload = {} }) => {
  const allowedDestinations = ['dialog', 'opener', 'bridge'];

  if (!target) {
    throw new Error('You must provide message target window!');
  }

  if (!meta.to) {
    throw new Error('You must provide message destination in meta.to!');
  }

  if (!meta.from) {
    throw new Error('You must provide message source in meta.from!');
  }

  if (!allowedDestinations.includes(meta.to)) {
    throw new Error(`You provide invalid message receiver type: ${meta.to}!`);
  }

  if (!allowedDestinations.includes(meta.from)) {
    throw new Error(`You provide invalid message sender type: ${meta.from}!`);
  }

  const baseMessage = {
    meta: {
      to: `endpass-connect-${meta.to}`,
      from: `endpass-connect-${meta.from}`,
    },
  };

  target.postMessage(
    Object.assign(baseMessage, {
      payload,
    }),
    '*',
  );
};

export const sendMessageToDialog = (target, payload) =>
  sendMessage({
    meta: {
      to: 'dialog',
      from: 'opener',
    },
    target,
    payload,
  });

export const sendMessageToBridge = (target, payload) =>
  sendMessage({
    meta: {
      to: 'bridge',
      from: 'opener',
    },
    target,
    payload,
  });

export const sendMessageToOpener = (from, payload) => {
  sendMessage({
    target: from === 'bridge' ? window.parent : window.opener,
    meta: {
      to: 'opener',
      from,
    },
    payload,
  });
};

export const awaitMessageFrom = from =>
  new Promise(resolve => {
    /* eslint-disable-next-line */
    const handler = ({ data = {} }) => {
      const isMessageToDialog =
        get(data, 'meta.to') === `endpass-connect-${from}`;

      if (isMessageToDialog && data.payload) {
        window.removeEventListener('message', handler);

        return resolve(data.payload);
      }
    };

    window.addEventListener('message', handler);
  });

export const awaitMessageFromOpener = () =>
  new Promise(resolve => {
    /* eslint-disable-next-line */
    const handler = ({ data = {} }) => {
      const isMessageToDialog =
        get(data, 'meta.to') === 'endpass-connect-dialog';

      if (isMessageToDialog && data.payload) {
        window.removeEventListener('message', handler);

        return resolve(data.payload);
      }
    };

    window.addEventListener('message', handler);
  });

export const awaitDialogMessage = () =>
  new Promise(resolve => {
    /* eslint-disable-next-line */
    const handler = ({ data = {} }) => {
      const isMessageToOpener =
        get(data, 'meta.to') === 'endpass-connect-opener';

      if (isMessageToOpener && data.payload) {
        window.removeEventListener('message', handler);

        return resolve(data.payload);
      }
    };

    window.addEventListener('message', handler);
  });

export const awaitBridgeMessage = () =>
  new Promise(resolve => {
    /* eslint-disable-next-line */
    const handler = ({ data = {} }) => {
      const isMessageFromBridge =
        get(data, 'meta.from') === 'endpass-connect-bridge';

      if (isMessageFromBridge && data.payload) {
        window.removeEventListener('message', handler);

        return resolve(data.payload);
      }
    };

    window.addEventListener('message', handler);
  });

export const subscribeOnBridgeMessages = handler => {
  window.addEventListener('message', ({ data = {} }) => {
    const isMessageToBridge = get(data, 'meta.to') === 'endpass-connect-bridge';

    if (isMessageToBridge) {
      handler(data.payload);
    }
  });
};

export default {
  sendMessage,
  sendMessageToDialog,
  sendMessageToOpener,
  sendMessageToBridge,
  awaitMessageFromOpener,
  awaitDialogMessage,
  awaitBridgeMessage,
  subscribeOnBridgeMessages,
};

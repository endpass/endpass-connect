export const sendMessage = ({ target, from, to, data }) => {
  const allowedDestinations = ['dialog', 'opener', 'bridge'];

  if (!target) {
    throw new Error('You must provide message target window!');
  }

  if (!to) {
    throw new Error('You must provide message destination!');
  }

  if (!allowedDestinations.includes(to)) {
    throw new Error(`You provide invalid message receiver type: ${to}!`);
  }

  if (!allowedDestinations.includes(from)) {
    throw new Error(`You provide invalid message sender type: ${from}!`);
  }

  const baseMessage = {
    to: `endpass-connect-${to}`,
    from: `endpass-connect-${from}`,
  };

  target.postMessage(Object.assign(baseMessage, data), '*');
};

export const sendMessageToDialog = ({ target, data }) =>
  sendMessage({
    to: 'dialog',
    from: 'opener',
    target,
    data,
  });

export const sendMessageToBridge = ({ target, data }) =>
  sendMessage({
    to: 'bridge',
    from: 'opener',
    target,
    data,
  });

export const sendMessageToOpener = ({ data, from }) => {
  sendMessage({
    to: 'opener',
    target: from === 'bridge' ? window.parent : window.opener,
    from,
    data,
  });
};

export const awaitMessageFromOpener = () =>
  new Promise(resolve => {
    /* eslint-disable-next-line */
    const handler = ({ data: messageData = {} }) => {
      const { to, ...data } = messageData;
      const isMessageToDialog = to === 'endpass-connect-dialog';

      if (isMessageToDialog && data) {
        window.removeEventListener('message', handler);

        return resolve(data);
      }
    };

    window.addEventListener('message', handler);
  });

export const awaitDialogMessage = () =>
  new Promise((resolve, reject) => {
    /* eslint-disable-next-line */
    const handler = ({ data: messageData = {} }) => {
      const isMessageToOpener = messageData.to === 'endpass-connect-opener';

      if (isMessageToOpener && messageData) {
        const { status, message = null, ...data } = messageData;

        window.removeEventListener('message', handler);

        return status
          ? resolve({
              status,
              message,
              data,
            })
          : reject(message);
      }
    };

    window.addEventListener('message', handler);
  });

export const awaitBridgeMessage = () =>
  new Promise(resolve => {
    /* eslint-disable-next-line */
    const handler = ({ data: messageData = {} }) => {
      const { to, from, ...data } = messageData;
      const isMessageFromBridge = from === 'endpass-connect-bridge';

      if (isMessageFromBridge && data) {
        window.removeEventListener('message', handler);

        return resolve(data);
      }
    };

    window.addEventListener('message', handler);
  });

export const subscribeOnBridgeMessages = handler => {
  window.addEventListener('message', ({ data: messageData = {} }) => {
    const isMessageToBridge = messageData.to === 'endpass-connect-bridge';

    if (isMessageToBridge) {
      handler(messageData);
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

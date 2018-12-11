export const sendMessage = ({ target, source, data }) => {
  if (!target) {
    throw new Error('You must provide message target window!');
  }

  if (!source) {
    throw new Error('You must provide message source!');
  }

  if (!['dialog', 'opener'].includes(source)) {
    throw new Error(
      `You provide invalid message source type ${source}, it must be equals to "opener" or "dialog"!`,
    );
  }

  const baseMessage = {
    source: `endpass-connect-${source}`,
  };

  target.postMessage(Object.assign(baseMessage, data), '*');
};

export const sendMessageToDialog = ({ target, data }) =>
  sendMessage({
    source: 'opener',
    target,
    data,
  });

export const sendMessageToOpener = ({ data }) =>
  sendMessage({
    source: 'dialog',
    target: window.opener,
    data,
  });

export const awaitMessageFromOpener = () =>
  new Promise(resolve => {
    /* eslint-disable-next-line */
    const handler = ({ data: messageData = {} }) => {
      const { source, ...data } = messageData;
      const isMessageFromOpener = source === 'endpass-connect-opener';

      if (isMessageFromOpener && data) {
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
      const isMessageFromDialog =
        messageData.source === 'endpass-connect-dialog';

      if (isMessageFromDialog && messageData) {
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

export default {
  sendMessage,
  sendMessageToDialog,
  sendMessageToOpener,
  awaitMessageFromOpener,
  awaitDialogMessage,
};

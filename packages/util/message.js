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
  sendMessage({ target, data, source: 'opener' });

export const sendMessageToOpener = ({ data }) =>
  sendMessage({ data, target: window.opener, source: 'dialog' });

export const awaitMessageFromOpener = () =>
  new Promise(resolve => {
    const handler = message => {
      if (!message.data) return;

      window.removeEventListener('message', handler);

      const { source, ...data } = message.data;
      const isMessageFromOpener = source === 'endpass-connect-opener';

      if (isMessageFromOpener) {
        return resolve(data);
      }
    };

    window.addEventListener('message', handler);
  });

export const awaitDialogMessage = () =>
  new Promise((resolve, reject) => {
    const handler = message => {
      if (!message.data) return;

      window.removeEventListener('message', handler);

      const { source, ...data } = message.data;
      const isMessageFromDialog = source === 'endpass-connect-dialog';

      if (isMessageFromDialog && data.status) {
        return resolve(data);
      }

      if (isMessageFromDialog && !data.status) {
        return reject(data.message);
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

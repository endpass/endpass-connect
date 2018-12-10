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

export default {
  sendMessage,
  sendMessageToDialog,
  sendMessageToOpener,
};

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

export const sendMessageToOpener = (target, from, payload) => {
  sendMessage({
    meta: {
      to: 'opener',
      from,
    },
    target,
    payload,
  });
};

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

// TODO: merge two methods below
export const awaitDialogMessage = method =>
  new Promise(resolve => {
    /* eslint-disable-next-line */
    const handler = ({ data = {} }) => {
      const isMessageToOpener =
        get(data, 'meta.to') === 'endpass-connect-opener';
      const isMethodMatched = !method || method === get(data, 'payload.method');

      if (isMessageToOpener && isMethodMatched && data.payload) {
        window.removeEventListener('message', handler);

        return resolve(data.payload);
      }
    };

    window.addEventListener('message', handler);
  });

export const awaitBridgeMessage = method =>
  new Promise(resolve => {
    /* eslint-disable-next-line */
    const handler = ({ data = {} }) => {
      const isMessageFromBridge =
        get(data, 'meta.from') === 'endpass-connect-bridge';
      const isMethodMatched = !method || method === get(data, 'payload.method');

      if (isMessageFromBridge && isMethodMatched && data.payload) {
        window.removeEventListener('message', handler);

        return resolve(data.payload);
      }
    };

    window.addEventListener('message', handler);
  });

export const forceDialogMessage = (target, payload) => {
  if (!payload.method) {
    throw new Error('Payload must includes method proprerty!');
  }

  return new Promise(resolve => {
    const interval = setInterval(() => {
      sendMessageToDialog(target, payload);
    }, 250);

    return awaitDialogMessage(payload.method).then(res => {
      clearInterval(interval);
      return resolve(res);
    });
  });
};

export const createSubscribtion = (direction, method) => ({
  listener: null,

  on(handler) {
    this.listener = ({ source, data = {} }) => {
      const isCorrectDirection =
        get(data, 'meta.to') === `endpass-connect-${direction}`;
      const isMethodMatched = !method || get(data, 'payload.method') === method;

      if (isCorrectDirection && isMethodMatched) {
        handler(source, data.payload);
      }
    };

    window.addEventListener('message', this.listener);
  },

  off() {
    if (this.listener) {
      window.removeEventListener('message', this.listener);
      this.listener = null;
    }
  },
});

export default {
  sendMessage,
  sendMessageToDialog,
  sendMessageToOpener,
  sendMessageToBridge,
  awaitMessageFromOpener,
  awaitDialogMessage,
  awaitBridgeMessage,
  createSubscribtion,

  forceDialogMessage,
};

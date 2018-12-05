export const sendMessage = data => {
  const baseMessage = {
    source: 'endpass-connect-dialog',
  }

  window.opener.postMessage(
    JSON.stringify(Object.assign(baseMessage, data)),
    '*',
  );
};

export default {
  sendMessage,
};

export const getCodeSuccess = {
  payload: {
    method: 'eth_getCode',
    params: ['0x31ea8795ee32d782c8ff41a5c68dcbf0f5b27f6d', 'latest'],
  },
  result: '0x',
};
export const getTransactionCountSuccess = {
  payload: {
    method: 'eth_getTransactionCount',
    params: ['0x31ea8795ee32d782c8ff41a5c68dcbf0f5b27f6d', 'latest'],
  },
  result: '0x0',
};
export const sendRawTransactionSuccess = {
  payload: {
    method: 'eth_sendRawTransaction',
    params: [
      '0xf86a80843b9aca008252089431ea8795ee32d782c8ff41a5c68dcbf0f5b27f6d872386f26fc10000801ca05548de205f75449ad5911ca7e1b3bb2ccc75bfa4541c637266a4d409b9ee48daa0168ee675dce486c76c99d4f7f5b6eb3d4f3d8e17a1e2f9e4f69ab563fad48fb3',
    ],
  },
  result: '0x0',
};
export const getTransactionReceiptSuccess = {
  payload: {
    method: 'eth_getTransactionReceipt',
    params: [null],
  },
  result: {
    transactionHash:
      '0xb48faea93f5df771a19917735addeb7004d7d3b7115e8138a54d3a907d2b4a49',
    transactionIndex: '0x0',
    status: '0x1',
    gasUsed: '0x5208',
    cumulativeGasUsed: '0x5208',
  },
};
export const subscribeError = {
  payload: {
    method: 'eth_subscribe',
    params: ['newHeads'],
  },
  result: {
    error: -32090,
    message: 'Subscriptions are not available on this transport.',
  },
};

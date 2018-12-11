import { Wallet } from '@@/class';
import web3 from '@@/class/singleton/web3';
import { sendMessageToOpener, awaitMessageFromOpener } from '@@/util/message';

const awaitRequestMessage = async ({ commit }) => {
  const res = await awaitMessageFromOpener();

  if (res) {
    commit('setRequest', res);
  }
};

const sendResponse = async ({ dispatch }, payload) => {
  sendMessageToOpener({
    data: {
      ...payload,
      status: true,
    },
  });
  dispatch('closeDialog');
};

const processRequest = async ({ state, commit, dispatch }, password) => {
  commit('changeLoadingStatus', true);

  const { address, request } = state.request;
  const account = await dispatch('getAccount', address);
  const wallet = new Wallet(account);

  try {
    const signResult = await dispatch('getSignedRequest', { wallet, password });

    dispatch('sendResponse', {
      id: request.id,
      result: signResult,
      jsonrpc: request.jsonrpc,
    });
  } catch (err) {
    dispatch('sendResponse', {
      id: request.id,
      result: [],
      error: err,
      jsonrpc: request.jsonrpc,
    });
  }
};

const getSignedRequest = async ({ state, dispatch }, payload) => {
  const { method } = state.request;

  switch (method) {
    case 'eth_sendTransaction':
      return dispatch('getSignedTransaction', payload);
    case 'eth_signTypedData':
      return dispatch('getSignedTypedDataRequest', payload);
    default:
      return dispatch('getSignedPlainRequest', payload);
  }
};

const getSignedTransaction = async ({ state }, { password, wallet }) => {
  const { request } = state.request;
  const nonce = await wallet.getNextNonce();
  const signedTx = await wallet.signTransaction(
    {
      ...request.transaction,
      nonce,
    },
    password,
  );

  return new Promise((resolve, reject) => {
    // TODO may be move it to the Wallet class
    const sendEvent = web3.eth.sendSignedTransaction(signedTx);

    sendEvent.then(receipt => resolve(receipt.transactionHash));
    sendEvent.on('error', error => reject(error));
    sendEvent.catch(error => reject(error));
  });
};

const getSignedTypedDataRequest = async () => {
  // const wallet = rootGetters['accounts/wallet'];
  // const request = getters.currentRequest;
  throw new Error('Sign typed data not supported yet!');
};

const getSignedPlainRequest = async ({ state }, { password, wallet }) => {
  const { request } = state.request;
  const res = await wallet.sign(request.params[0], password);

  return res.signature;
};

const sendRequestToNetwork = (ctx, request) =>
  new Promise((resolve, reject) => {
    this.web3.currentProvider.sendAsync(request, (err, res) => {
      if (err) {
        return reject(err);
      }

      return resolve(res);
    });
  });

const cancelRequest = ({ state, dispatch }) => {
  const { request } = state.request;

  dispatch('sendResponse', {
    id: request.id,
    error: 'canceled',
    result: [],
  });
};

export default {
  awaitRequestMessage,
  processRequest,
  sendResponse,
  getSignedRequest,
  getSignedTypedDataRequest,
  getSignedTransaction,
  getSignedPlainRequest,
  sendRequestToNetwork,
  cancelRequest,
};

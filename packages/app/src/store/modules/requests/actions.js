import web3 from '@@/class/singleton/web3';
import { Wallet } from '@@/class';
import { awaitMessageFromOpener } from '@@/util/message';

const awaitRequestMessage = async ({ commit }) => {
  const res = await awaitMessageFromOpener();

  if (res) {
    commit('setRequest', res);
  }
};

// Wallet things

const processRequest = async ({ state, dispatch }, password) => {
  const { request } = state;
  const { jsonrpc } = request;
  const account = await dispatch('getAccount', request.address);
  const wallet = new Wallet(account);

  try {
    const signResult = await dispatch('getSignedRequest', { wallet, password });

    console.log('sign result', signResult);

    // dispatch('sendResponse', {
    //   id: requestId,
    //   result: signResult,
    //   jsonrpc,
    // });
  } catch (err) {
    // const notificationError = new NotificationError({
    //   title: 'Sign error',
    //   text: error.message,
    //   type: 'is-danger',
    // });

    // dispatch('errors/emitError', notificationError, { root: true });
    // dispatch('sendResponse', {
    //   id: requestId,
    //   error,
    //   result: [],
    //   jsonrpc,
    // });

    console.log('sign error', err);
  } finally {
    console.log('asdasdasd');
    // commit(REMOVE_REQUEST, requestId);
  }
};

const getSignedRequest = async ({ state, dispatch }, payload) => {
  const { request } = state;

  switch (method) {
    case 'eth_sendTransaction':
      return dispatch('getSignedTransaction', payload);
    case 'eth_signTypedData':
      return dispatch('getSignedTypedDataRequest', payload);
    default:
      return dispatch('getSignedPlainRequest', payload);
  }
};

const getSignedTransaction = async (
  { dispatch, getters, rootGetters },
  { password, wallet },
) => {
  // const wallet = rootGetters['accounts/wallet'];
  // const request = getters.currentRequest;
  // const nonce = await dispatch('transactions/getNextNonce', null, {
  //   root: true,
  // });
  // const signedTx = await wallet.signTransaction(
  //   {
  //     ...request.transaction,
  //     nonce,
  //   },
  //   password,
  // );

  return new Promise((resolve, reject) => {
    //     const sendEvent = web3.eth.sendSignedTransaction(signedTx);
    //
    //     sendEvent.then(receipt => resolve(receipt.transactionHash));
    //
    //     sendEvent.on('error', error => reject(error));
    //     sendEvent.catch(error => reject(error));
  });
};

const getSignedTypedDataRequest = async () => {
  // const wallet = rootGetters['accounts/wallet'];
  // const request = getters.currentRequest;

  throw new Error('Sign typed data not supported yet!');
};

const getSignedPlainRequest = async ({ state }, { password, wallet }) => {
  const { request } = state;
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

// const cancelCurrentRequest = ({ commit, dispatch, getters }) => {
//   const requestId = getters.currentRequestId;
//
//   if (!requestId) return;
//
//   dispatch('sendResponse', {
//     id: requestId,
//     error: 'canceled',
//     result: [],
//   });
//   commit(REMOVE_REQUEST, requestId);
// };

export default {
  awaitRequestMessage,
  processRequest,
  getSignedRequest,
  getSignedTypedDataRequest,
  getSignedTransaction,
  getSignedPlainRequest,
  sendRequestToNetwork,
};

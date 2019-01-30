import Wallet from '@/class/Wallet';
import { awaitMessageFromOpener } from '@/util/message';

const awaitRequestMessage = async ({ commit, dispatch }) => {
  const res = await awaitMessageFromOpener();

  if (res) {
    await dispatch('setWeb3NetworkProvider', res.net);

    commit('setRequest', res);
  }
};

const sendResponse = async ({ dispatch }, payload) => {
  dispatch('resolveMessage', {
    status: true,
    ...payload,
  });
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
    console.log(err.message);

    if (err.message.includes('message authentication code mismatch')) {
      commit('changeLoadingStatus', false);

      throw new Error('You have enter incorrect password');
    } else {
      dispatch('sendResponse', {
        id: request.id,
        result: [],
        error: err,
        jsonrpc: request.jsonrpc,
        status: false,
      });
    }
  }
};

const recoverMessage = async ({ dispatch }, payload) => {
  const { address, request } = payload;

  try {
    const account = await dispatch('getAccount', address);
    const wallet = new Wallet(account);
    const res = await wallet.recover(request.params[0], request.params[1]);

    return {
      id: request.id,
      result: res,
      jsonrpc: request.jsonrpc,
    };
  } catch (err) {
    return {
      id: request.id,
      result: null,
      error: err,
      jsonrpc: request.jsonrpc,
    };
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
  const res = await wallet.sendSignedTransaction(request.transaction, password);

  return res;
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
  recoverMessage,
  sendResponse,
  getSignedRequest,
  getSignedTypedDataRequest,
  getSignedTransaction,
  getSignedPlainRequest,
  cancelRequest,
};

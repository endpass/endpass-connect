import { get } from 'lodash';
import Tx from 'ethereumjs-tx';
import web3 from '@@/class/singleton/web3';
import keystore from '@@/util/keystore';

const { isAddress, bytesToHex } = web3.utils;

/**
 * A Wallet represents a single Ethereum account that can send transactions
 * ! All methods are async and return promises
 * @constructor
 * @param {Object} account Account object
 */
export default class Wallet {
  constructor(v3Keystore) {
    const address = Wallet.normalizeAddress(v3Keystore.address);

    if (!isAddress(address)) {
      throw new Error(`${address} is not valid Etherium address!`);
    }

    const isPublic = !keystore.isV3(v3Keystore);

    this.address = address;
    this.index = get(v3Keystore, 'info.index');
    this.v3 = isPublic ? null : v3Keystore;
    this.signStrategy = null;
    this.isPublic = isPublic;
  }

  /**
   *
   * @param {*} address
   */
  static normalizeAddress(address) {
    if (/^xpub/.test(address)) {
      return Wallet.getAddressFromXpub(address);
    }

    return `0x${address.replace(/^0x/, '')}`;
  }

  /**
   * Returns decrypted private key buffer
   * @param {String} password Account password
   * @returns {Promise<Buffer>} Private key buffer
   */
  async getPrivateKey(password) {
    return keystore.decrypt(password, this.v3);
  }

  /**
   * Returns decrypted private key in string
   * @param {String} password Account password
   * @returns {Promise<String>} Private key string
   */
  async getPrivateKeyString(password) {
    const privateKey = await this.getPrivateKey(password);

    return bytesToHex(privateKey);
  }

  /**
   * Validates account password
   * Throws error on validation failure
   * @param {String} password Account password
   * @throws {Error}
   * @returns {Boolean}
   */
  async validatePassword(password) {
    try {
      await this.getPrivateKey(password);

      return true;
    } catch (e) {
      throw new Error('Invalid password');
    }
  }

  /**
   * Return signed message object
   * @param {String} message Message for signing
   * @return {Promise<Object<SignedMessage>>} Return signed message object
   */
  async sign(data, password) {
    const privateKey = await this.getPrivateKeyString(password);

    return this.web3.eth.accounts.sign(data, privateKey);
  }

  /**
   * Recover account address from signed message/hash
   * @param {String} message Message/hash for signing
   * @param {String<Signature>} signature Signature from signing
   * @return {Promise<Address>} Resolve account address
   */
  /* eslint-disable-next-line */
  async recover(message, signature) {
    return this.web3.eth.accounts.recover(message, signature);
  }

  /**
   * Return signed transaction hash
   * @param {Transaction} transaction Transaction instance
   * @return {String<SignedTrxHash>} Resolve signed transaction hash
   */
  async signTransaction(transaction, password) {
    const privateKey = await this.getPrivateKey(password);
    const tx = transaction instanceof Tx ? transaction : new Tx(transaction);

    await tx.sign(privateKey);

    return `0x${tx.serialize().toString('hex')}`;
  }
}

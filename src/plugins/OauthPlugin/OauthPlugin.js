// @ts-check

import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import OauthPkceStrategy from '@/plugins/OauthPlugin/Oauth/OauthPkceStrategy';
import Oauth from '@/plugins/OauthPlugin/Oauth';
import PluginBase from '../PluginBase';
import { DialogPlugin } from '@/plugins/DialogPlugin';
import { MessengerGroupPlugin } from '@/plugins/MessengerGroupPlugin';
import { DocumentPlugin } from '@/plugins/DocumentPlugin';
import OauthApi from '@/plugins/OauthPlugin/OauthPublicApi';
import {
  DIRECTION,
  MESSENGER_METHODS,
  PLUGIN_METHODS,
  PLUGIN_NAMES,
} from '@/constants';
import oauthHandlers from '@/plugins/OauthPlugin/oauthHandlers';
import FrameStrategy from '@/plugins/OauthPlugin/FrameStrategy';
import ConnectError from '@/class/ConnectError';

const { ERRORS } = ConnectError;

const documentsCheckReg = /\/documents$/gi;

/**
 * @typedef {{
 * isNeedUploadDocument: boolean,
 * signedString: string,
 * filteredIdsList: string[]}} AnswerResult
 */

export default class OauthPlugin extends PluginBase {
  /**
   * @returns {string}
   */
  static get pluginName() {
    return PLUGIN_NAMES.OAUTH;
  }

  /**
   * @returns {OauthHandlers}
   */
  static get handlers() {
    return oauthHandlers;
  }

  /**
   * @returns {[typeof DialogPlugin, typeof MessengerGroupPlugin, typeof DocumentPlugin]}
   */
  static get dependencyPlugins() {
    return [DialogPlugin, MessengerGroupPlugin, DocumentPlugin];
  }

  /**
   * @returns {typeof OauthApi}
   */
  static get publicApi() {
    return OauthApi;
  }

  /**
   * @returns {CrossWindowMessenger}
   */
  get messenger() {
    if (!this.oauthMessenger) {
      this.oauthMessenger = new CrossWindowMessenger({
        // showLogs: !ENV.isProduction,
        name: 'connect-oauth-iframe[]',
        to: DIRECTION.AUTH,
        from: DIRECTION.CONNECT,
      });
    }

    return this.oauthMessenger;
  }

  /**
   * @param {object} params
   * @param {import('axios').AxiosRequestConfig} params.result
   * @param {string[]} params.filteredIdsList
   * @returns {import('axios').AxiosRequestConfig}
   */
  createDocumentsResult({ result, filteredIdsList }) {
    const data = result.data.filter(
      /**
       * @param {UserDocument} document
       * @returns {boolean}
       */
      document => filteredIdsList.includes(document.id),
    );
    return {
      ...result,
      data,
    };
  }

  /**
   * @param {OauthPluginOptions} options
   * @param {Context} context
   */
  constructor(options, context) {
    super(options, context);

    const { clientId, oauthServer, isPopup } = options;

    this.clientId = clientId;
    this.frameStrategy = new FrameStrategy({
      isPopup,
    });

    this.frameStrategy.on(
      FrameStrategy.EVENT_UPDATE_TARGET,
      /** @param {ContextWindow} target */ target => {
        this.messenger.setTarget(target);
      },
    );

    const oauthStrategy = new OauthPkceStrategy({
      context,
    });

    this.oauthRequestProvider = new Oauth({
      clientId,
      oauthServer,
      oauthStrategy,
      frameStrategy: this.frameStrategy,
    });
  }

  /**
   * @param {ContextWindow} [source]
   * @returns {boolean}
   */
  isSourceEqualTarget(source) {
    return source === this.frameStrategy.target;
  }

  /**
   * @returns {void}
   */
  handleReadyFrame() {
    this.frameStrategy.handleReady();
  }

  /**
   * @returns {void}
   */
  connectionOpen() {
    this.frameStrategy.connectionOpen();
  }

  /**
   * @returns {void}
   */
  connectionError() {
    this.frameStrategy.connectionError();
  }

  /**
   * @param {OauthResizeFrameEventPayload} payload
   * @returns {void}
   */
  resizeFrame(payload) {
    this.frameStrategy.handleResize(payload);
  }

  /**
   * @returns {void}
   */
  handleCloseFrame() {
    this.frameStrategy.close();
  }

  /**
   * @param {object} params
   * @param {number} params.code
   * @param {string} params.hash
   */
  changeAuthStatus({ code, hash }) {
    this.oauthRequestProvider.changeAuthStatus({
      code,
      hash,
    });
  }

  /**
   * @returns {void}
   */
  logout() {
    this.oauthRequestProvider.dropToken();
  }

  /**
   * @param {object} params
   * @param {object[]} params.documentsList
   * @param {string} params.signedString
   * @throws {ConnectError} If required failed
   * @returns {Promise<AnswerResult>}
   */
  async checkDocumentRequired({ documentsList, signedString }) {
    try {
      const { payload, status, error } = await this.context.ask(
        MESSENGER_METHODS.CHECK_DOCUMENTS_REQUIRED,
        {
          clientId: this.clientId,
          documentsList,
          signedString,
        },
      );

      if (!status) {
        throw ConnectError.create(
          error || ERRORS.CREATE_DOCUMENTS_REQUIRED,
          'Documents required creation error',
        );
      }

      return payload;
    } catch (e) {
      throw ConnectError.create(e.code || ERRORS.CREATE_DOCUMENTS_REQUIRED);
    }
  }

  /**
   * @returns {Promise<AnswerResult>}
   * @throws {ConnectError} If required failed
   */
  async createDocumentsRequired() {
    try {
      const data = await this.context.executeMethod(
        PLUGIN_METHODS.CONTEXT_CREATE_DOCUMENTS_REQUIRED,
      );

      return data;
    } catch (e) {
      // TODO: should create axios error or not?
      throw ConnectError.create(e.code || ERRORS.CREATE_DOCUMENTS_REQUIRED);
    }
  }

  /**
   * @param {import('axios').AxiosRequestConfig} result
   * @param {OauthRequestOptions} options
   * @returns {Promise<any>}
   */
  async handleDocument(result, options) {
    const signedString = this.oauthRequestProvider.getSignedString();
    const payload = await this.checkDocumentRequired({
      documentsList: result.data,
      signedString,
    });

    if (!payload.isNeedUploadDocument) {
      return this.createDocumentsResult({
        result,
        filteredIdsList: payload.filteredIdsList,
      });
    }

    const requiredPayload = await this.createDocumentsRequired();
    this.oauthRequestProvider.setSignedString(requiredPayload.signedString);

    const isDocumentsExists = requiredPayload.filteredIdsList.every(
      documentId =>
        result.data.find(
          /**
           * @param {UserDocument} document
           * @returns {boolean}
           */
          document => document.id === documentId,
        ),
    );

    if (isDocumentsExists) {
      return this.createDocumentsResult({
        result,
        filteredIdsList: requiredPayload.filteredIdsList,
      });
    }

    const resultDocuments = await this.oauthRequestProvider.request(options);

    return this.createDocumentsResult({
      result: resultDocuments,
      filteredIdsList: requiredPayload.filteredIdsList,
    });
  }

  /**
   * @param {OauthRequestOptions} options
   * @returns {Promise<any>}
   */
  async request(options) {
    const result = await this.oauthRequestProvider.request(options);

    // TODO: add hooks ?
    // await hook('request', result);

    const isDocumentRequest =
      options.url && options.url.search(documentsCheckReg) !== -1;

    if (!isDocumentRequest) {
      return result;
    }

    return this.handleDocument(result, options);
  }
}

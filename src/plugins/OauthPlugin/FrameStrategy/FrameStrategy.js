// @ts-check
import EventEmitter from '@endpass/class/EventEmitter';
import IframeFrame from '@/plugins/OauthPlugin/FrameStrategy/IframeFrame';
import PopupFrame from '@/plugins/OauthPlugin/FrameStrategy/PopupFrame';
import BaseWindow from '@/plugins/OauthPlugin/FrameStrategy/BaseWindow';

export default class FrameStrategy {
  static EVENT_UPDATE_TARGET = 'update-target';

  constructor() {
    this.frame = new BaseWindow();
    this.emitter = new EventEmitter();
  }

  /**
   *
   * @param {string} url
   */
  async open(url) {
    try {
      await this.initFrame(IframeFrame, url);
    } catch (e) {
      await this.initFrame(PopupFrame, url);
    }

    this.frame.open();
  }

  /**
   *
   * @private
   * @param {typeof IframeFrame|typeof PopupFrame} Frame
   * @param {string} url
   * @return {Promise<void>}
   */
  async initFrame(Frame, url) {
    this.frame = new Frame(url);
    this.frame.mount();
    this.emitter.emit(FrameStrategy.EVENT_UPDATE_TARGET, this.frame.target);
    await this.frame.waitReady();
  }

  /**
   *
   * @param {string} method
   * @param {CallableFunction} cb
   */
  on(method, cb) {
    this.emitter.on(method, cb);
  }

  get target() {
    return this.frame.target;
  }

  /**
   *
   * @param {*} payload
   * @param {object} req
   */
  handleReady(payload, req) {
    if (req.source === this.frame.target) {
      this.frame.handleReady();
    }
  }

  close() {
    this.frame.close();
    this.frame = new BaseWindow();
  }

  /**
   *
   * @param {{offsetHeight:number}} payload
   */
  handleResize(payload) {
    this.frame.resize(payload);
  }
}

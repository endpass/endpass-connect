// @ts-check
import EventEmitter from '@endpass/class/EventEmitter';
import IframeFrame from '@/plugins/OauthPlugin/FrameStrategy/IframeFrame';
import PopupFrame from '@/plugins/OauthPlugin/FrameStrategy/PopupFrame';
import BaseWindow from '@/plugins/OauthPlugin/FrameStrategy/BaseWindow';

// const sleep = (ms = 1000) => {
//   return new Promise(resolve => setTimeout(resolve, ms));
// };

export default class FrameStrategy {
  static EVENT_UPDATE_TARGET = 'update-target';

  constructor() {
    this.frame = new BaseWindow();
    this.emitter = new EventEmitter();
    this.fallbackFrame = new PopupFrame();
  }

  prepare() {
    this.fallbackFrame.initFallback();
  }

  /**
   *
   * @param {string} url
   */
  async open(url) {
    try {
      // await sleep(5000);
      // const frame = this.fallbackFrame;
      // await this.initFrame(frame, url);

      const frame = new IframeFrame();
      await this.initFrame(frame, url);
      this.fallbackFrame.close();
    } catch (e) {
      await this.initFrame(this.fallbackFrame, url);
    }

    this.frame.open();
  }

  /**
   *
   * @private
   * @param {IframeFrame|PopupFrame} frame
   * @param {string} url
   * @return {Promise<void>}
   */
  async initFrame(frame, url) {
    this.frame = frame;
    this.frame.init(url);
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

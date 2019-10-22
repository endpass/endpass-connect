// @ts-check
import EventEmitter from '@endpass/class/EventEmitter';
import IframeFrame from '@/plugins/OauthPlugin/FrameStrategy/IframeFrame';
import PopupFrame from '@/plugins/OauthPlugin/FrameStrategy/PopupFrame';

export default class FrameStrategy {
  static EVENT_UPDATE_TARGET = 'update-target';

  /**
   * @param {object} params
   * @param {boolean=} params.oauthPopup
   */
  constructor({ oauthPopup = false }) {
    this.emitter = new EventEmitter();
    this.frame = oauthPopup ? new PopupFrame() : new IframeFrame();
  }

  prepare() {
    this.frame.prepare();
  }

  /**
   *
   * @param {string} url
   * @return {Promise<void>}
   */
  async open(url) {
    this.frame.init(url);
    this.frame.mount();
    this.emitter.emit(FrameStrategy.EVENT_UPDATE_TARGET, this.frame.target);
    await this.frame.waitReady();
    this.frame.open();
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
  }

  /**
   *
   * @param {{offsetHeight:number}} payload
   */
  handleResize(payload) {
    this.frame.resize(payload);
  }
}

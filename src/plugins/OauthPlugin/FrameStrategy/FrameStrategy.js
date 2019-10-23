// @ts-check
import EventEmitter from '@endpass/class/EventEmitter';
import IframeFrame from '@/plugins/OauthPlugin/FrameStrategy/IframeFrame';
import PopupFrame from '@/plugins/OauthPlugin/FrameStrategy/PopupFrame';
import BaseWindow from '@/plugins/OauthPlugin/FrameStrategy/BaseWindow';

export default class FrameStrategy {
  static EVENT_UPDATE_TARGET = 'update-target';

  /**
   * @param {object} params
   * @param {boolean=} params.oauthPopup
   */
  constructor({ oauthPopup = false }) {
    this.emitter = new EventEmitter();
    this.oauthPopup = oauthPopup;
    this.frame = new BaseWindow();
  }

  prepare() {
    this.frame = this.oauthPopup ? new PopupFrame() : new IframeFrame();
    this.frame.prepare();
  }

  /**
   *
   * @param {string} url
   * @return {Promise<void>}
   */
  async open(url) {
    this.frame.mount(url);
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

  handleReady() {
    this.frame.handleReady();
  }

  close() {
    this.frame.destroy();
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

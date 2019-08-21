import Widget from '@/class/Widget';
import Auth from '@/class/Auth';
import Dialog from '@/class/Dialog';
import ElementsSubscriber from '@/class/ElementsSubscriber';
import { getAuthUrl, getFrameRouteUrl } from '@/util/url';
import { DEFAULT_AUTH_URL } from '@/constants';
import { MessengerGroup } from '@/class';

export default class BasicModules {
  constructor(options, context) {
    const { namespace, authUrl } = options;
    this.context = context;
    this.namespace = namespace || '';
    this.options = options;
    this.authUrl = getAuthUrl(authUrl || DEFAULT_AUTH_URL);
  }

  /**
   *
   * @return {Auth}
   */
  getAuthInstance() {
    if (!this.authRequester) {
      this.authRequester = new Auth({
        context: this.context,
      });
    }
    return this.authRequester;
  }

  /**
   *
   * @return {Dialog}
   */
  getDialogInstance() {
    if (!this.dialog) {
      this.dialog = new Dialog({
        namespace: this.namespace,
        url: getFrameRouteUrl(this.authUrl, 'bridge'),
      });
      this.getMessengerGroupInstance().addMessenger(
        this.dialog.getDialogMessenger(),
      );
    }

    return this.dialog;
  }

  /**
   *
   * @return {Widget}
   */
  getWidgetInstance() {
    if (!this.widget) {
      this.widget = new Widget({
        namespace: this.namespace,
        url: getFrameRouteUrl(this.authUrl, 'public/widget'),
      });
    }
    return this.widget;
  }

  /**
   *
   * @return {MessengerGroup}
   */
  getMessengerGroupInstance() {
    if (!this.messengerGroup) {
      this.messengerGroup = new MessengerGroup();
    }
    return this.messengerGroup;
  }

  /**
   *
   * @return {ElementsSubscriber}
   */
  getElementsSubscriberInstance() {
    if (!this.elementsSubscriber) {
      const { demoData, isIdentityMode, showCreateAccount } = this.options;
      this.elementsSubscriber = new ElementsSubscriber({
        context: this.context,
        initialPayload: {
          demoData,
          isIdentityMode: isIdentityMode || false,
          showCreateAccount,
        },
      });
    }

    return this.elementsSubscriber;
  }
}

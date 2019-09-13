import { MESSENGER_METHODS, PLUGIN_METHODS } from '@/constants';

export default {
  mountWidget: widgetPlugin =>
    /**
     * Mounts endpass widget
     * @param {object} [params] Parameters object
     * @param {object} [params.position] Position of mounting widget
     * @param {object} [params.position.left]
     * @param {object} [params.position.right]
     * @param {object} [params.position.top]
     * @param {object} [params.position.bottom]
     * @returns {Promise<Element>} Mounted widget iframe element
     */
    async params => {
      return widgetPlugin.context.executeMethod(
        PLUGIN_METHODS.CONTEXT_MOUNT_WIDGET,
        params,
      );
    },

  unmountWidget: widgetPlugin =>
    /**
     * Unmounts endpass widget from DOM
     */
    async () => {
      return widgetPlugin.context.executeMethod(
        MESSENGER_METHODS.WIDGET_UNMOUNT,
      );
    },

  getWidgetNode: widgetPlugin =>
    /**
     * Returns widget iframe element when it available
     * @returns {Promise<Element>} Widget iframe node
     */
    async () => {
      const res = await widgetPlugin.context.getWidgetNode();

      return res;
    },
};

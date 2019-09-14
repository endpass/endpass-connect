import { PLUGIN_METHODS, MESSENGER_METHODS } from '@/constants';

export default {
  auth: authPlugin =>
    /**
     * Open application on auth screen and waits result (success of failure)
     * @throws {Error} If authentication failed
     * @returns {Promise<boolean>} AuthorizePlugin result, check `status` property to
     *  know about result
     */
    async redirectUrl => {
      const res = await authPlugin.context.executeMethod(
        PLUGIN_METHODS.CONTEXT_AUTHORIZE,
        redirectUrl,
      );

      return {
        ...res.payload,
        status: res.status,
      };
    },

  logout: authPlugin =>
    /**
     * Send request to logout through injected bridge bypass application dialog
     * @private
     * @throws {Error} If logout failed
     * @returns {Promise<boolean>}
     */
    async () => {
      const { status } = await authPlugin.context.executeMethod(
        MESSENGER_METHODS.LOGOUT_REQUEST,
      );
      return status;
    },
};

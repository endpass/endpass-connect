import { PLUGIN_METHODS } from '@/constants';

export default class LoginButtonController {
  constructor(context) {
    this.context = context;
  }

  async getUserEmail() {
    await this.context.executeMethod(PLUGIN_METHODS.CONTEXT_LOGIN_WITH_OAUTH, {
      scopes: ['user:email:read'],
    });
    return this.context.executeMethod(PLUGIN_METHODS.CONTEXT_OAUTH_REQUEST, {
      url: '/settings',
    });
  }
}

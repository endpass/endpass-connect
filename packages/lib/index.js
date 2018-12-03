import identityService from '../service/identity';

class Connect {
  /**
   * Check auth status on endpass identity service
   * @returns {Promise<Boolean>} Auth status
   */
  static async status() {
    try {
      const res = await identityService.getAccounts();

      return !!res;
    } catch (err) {
      return false;
    }
  }

  /**
   * Boo Boo Boo
   */
  static async auth() {
    console.log(2);
  }
}

export default Connect;

export default class LoginButtonHandler {
  constructor(buttonController, userCallback) {
    return async function() {
      let error;
      let email;

      try {
        email = await buttonController.getUserEmail();
      } catch (e) {
        error = e;
      }

      if (userCallback instanceof Function) {
        userCallback(error, email);
      }
      this.disabled = true;
    };
  }
}

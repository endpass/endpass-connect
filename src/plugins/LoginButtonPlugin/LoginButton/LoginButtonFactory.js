import LoginButton from './LoginButton';
import LoginButtonHandler from './LoginButtonHandler';
import LoginButtonController from './LoginButtonController';

export default class LoginButtonFactory {
  static create({ rootElement, buttonLabel, isButtonLight, onLogin }, context) {
    const controller = new LoginButtonController(context);
    const clickHandler = new LoginButtonHandler(controller, onLogin);

    return new LoginButton({
      rootElement,
      buttonLabel,
      isButtonLight,
      clickHandler,
    });
  }
}

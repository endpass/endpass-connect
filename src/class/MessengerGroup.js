export default class MessengerGroup {
  constructor() {
    this.messengers = [];
  }

  addMessenger(messenger) {
    this.messengers.push(messenger);
  }

  removeMessenger(messenger) {
    this.messengers = this.messengers.filter(item => item !== messenger);
  }

  send(msg, payload) {
    this.messengers.forEach(messenger => {
      messenger.send(msg, payload);
    });
  }
}

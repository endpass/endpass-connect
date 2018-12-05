class Messenger {
  static sendMessage(type = null, data = {}) {
    window.postMessage(JSON.stringify({ type, data }), '*');
  }
}

export default Messenger;

// import '../../src/util/__mock__/message.mock';

global.flushPromises = () => new Promise(resolve => setImmediate(resolve));

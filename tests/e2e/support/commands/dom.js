const IFRAME_DEFAULT_TIMEOUT = 10 * 1000;
const IFRAME_EXIST_CHECK_TIMEOUT = 200;

Cypress.Commands.add(
  'getIframeElement',
  { prevSubject: 'element' },
  ($iframe, selector) => {
    Cypress.log({
      name: 'getIframeElement',
      consoleProps() {
        return {
          iframe: $iframe,
        };
      },
    });

    // hack for wait rendering element in DOM
    const checkExist = (node, select, resolve, timeout) => {
      // eslint-disable-next-line
      timeout = timeout - IFRAME_EXIST_CHECK_TIMEOUT;
      if (timeout < 0) {
        resolve(node.find(select));
        return;
      }
      setTimeout(() => {
        const res = node.find(select);
        if (res.length !== 0){
          resolve(res);
        } else {
          checkExist(node, select, resolve, timeout);
        }
      }, IFRAME_EXIST_CHECK_TIMEOUT);
    };

    return new Cypress.Promise(resolve => {
      const content = $iframe.contents().find('body');

      checkExist(content, selector, resolve, IFRAME_DEFAULT_TIMEOUT);
    });
  },
);

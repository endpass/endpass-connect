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
        if (res.length !== 0) {
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

Cypress.Commands.add('mockOnceIframeSrc', (matchSrc, matchHandler) => {
  const DOMEvents = {
    MutationNameEvent: 'DOMAttributeNameChanged DOMElementNameChanged',
    MutationEvent:
      'DOMAttrModified DOMNodeInserted DOMNodeInsertedIntoDocument DOMSubtreeModified',
  };

  const iterateEvents = iterator => {
    Object.keys(DOMEvents).forEach(DOMEvent => {
      const DOMEventTypes = DOMEvents[DOMEvent].split(' ');

      DOMEventTypes.forEach(DOMEventType => {
        iterator(DOMEventType);
      });
    });
  };

  const bindHandler = (doc, handler) => {
    iterateEvents(DOMEventType => {
      doc.addEventListener(DOMEventType, handler, true);
    });
  };

  const unbindHandler = (doc, handler) => {
    iterateEvents(DOMEventType => {
      doc.removeEventListener(DOMEventType, handler, true);
    });
  };

  const onIframe = e => {
    if (!e.target || !e.target.querySelectorAll) {
      return;
    }

    const iframeList = e.target.querySelectorAll('iframe');

    const doc = e.currentTarget;
    iframeList.forEach(iframe => {
      if (iframe.src.indexOf(matchSrc) !== -1) {
        unbindHandler(doc, onIframe);
        // eslint-disable-next-line no-param-reassign
        iframe.src = matchHandler(iframe.src);
      }
    });
  };

  cy.window().then(win => {
    bindHandler(win.document, onIframe);
  });
});

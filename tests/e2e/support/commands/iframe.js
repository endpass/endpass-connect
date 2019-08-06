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
    return new Cypress.Promise(resolve => {
      resolve($iframe.contents().find(selector));
    });
  },
);

Cypress.Commands.add(
  'iframe',
  { prevSubject: 'element' },
  ($iframe, selector) => {
    Cypress.log({
      name: 'iframe',
      consoleProps() {
        return {
          iframe: $iframe,
        };
      },
    });
    return new Cypress.Promise(resolve => {
      const el = $iframe.contents().find(selector);
      resolve($iframe.contents().find(selector));
    });
  },
);

Cypress.Commands.add('authBridgeFinish', () => {
  return cy.window().then(win => {
    cy.log(win);
    win.e2eBridge.setupFinish();
    return Cypress.Promise.resolve();
  });
});

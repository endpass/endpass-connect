Cypress.Commands.add('authBridgeFinish', () => {
  return cy.window().then(win => {
    cy.log(win);
    return win.e2eBridge.resumeClient();
  });
});

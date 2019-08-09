Cypress.Commands.add('authBridgeStart', () => {
  cy.wait(250);
  return cy.window().then(win => {
    cy.log(win);

    return win.e2eBridge.awaitClientPaused();
  });
});

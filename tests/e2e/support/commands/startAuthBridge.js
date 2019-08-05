Cypress.Commands.add('startAuthBridge', () => {
  cy.wait(250);
  return cy.window().then(win => {
    cy.log(win);

    return win.e2eBridge.awaitSetupFinish().then(() => {
      cy.clearMocks();
    });
  });
});

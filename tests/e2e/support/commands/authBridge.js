Cypress.Commands.add('startAuthBridge', () => {
  cy.wait(250);
  cy.window().then(win => {
    cy.log(win);
    win.e2eBridge.finishSetup();
  });
});

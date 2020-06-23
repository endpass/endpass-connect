Cypress.Commands.add('shouldLoggedIn', () => {
  cy.get('[data-test=endpass-app-loader]', {
    timeout: 200000,
  }).should('not.exist');
  cy.authFrameWrapperHidden().should('exist');
});

Cypress.Commands.add('shouldLogout', (callback) => {
  cy.window().then(w => w.isBeforeReload = true);

  cy.window().should('have.prop', 'isBeforeReload', true);
  callback();
  cy.wait('@routeAuthLogout');
  cy.window().should('not.have.prop', 'isBeforeReload');
});

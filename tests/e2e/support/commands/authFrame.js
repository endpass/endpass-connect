Cypress.Commands.add('authWrapperVisible', () => {
  return cy.get('[data-test=dialog-wrapper][data-visible=true]');
});

Cypress.Commands.add('authWrapperHidden', () => {
  return cy.get('[data-test=dialog-wrapper][data-visible=false]');
});

Cypress.Commands.add('getAuthFrame', () => {
  cy.authWrapperVisible();
  return cy.get('[data-test=dialog-iframe]').iframe();
});

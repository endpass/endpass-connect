Cypress.Commands.add('getAuthFrame', payload => {
  cy.get('[data-endpass=wrapper][data-visible=true]');
  return cy.get('[data-endpass=frame]');
});

Cypress.Commands.add('mockInitialData', () => {
  cy.mockAuth();
  cy.mockAccounts();
  cy.mockSettings();
  cy.mockBalance();
});

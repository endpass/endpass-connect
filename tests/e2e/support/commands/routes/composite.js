Cypress.Commands.add('mockInitialData', () => {
  cy.mockAuthCheck(200);
  cy.mockAuthPermission();

  cy.mockAuthLogin('emailLink');
  cy.mockAuthLogout();
  cy.mockAuthRecover();

  cy.mockAccountsV3();
  cy.mockAccountsList();
  cy.mockAccountUpdate();

  cy.mockSettings();

  cy.mockEtherPrices();
  cy.mockBalance();
});

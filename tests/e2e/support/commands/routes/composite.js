import { visitUrl, visitBlockBasic } from '@config';

Cypress.Commands.add('mockInitialData', () => {
  cy.mockAuthCheck(200);
  cy.mockAuthPermission();
  cy.mockOauthLogin();
  cy.mockOauthConsent();

  cy.mockAuthLogin('emailLink');

  cy.mockAuthLogout();
  cy.mockAuthRecover();

  cy.mockAccountsV3();
  cy.mockAccountsList();
  cy.mockAccountUpdate();

  cy.mockSettings();
  cy.mockRopstenFaucet();

  cy.mockEtherPrices();
  cy.mockBalance();
});


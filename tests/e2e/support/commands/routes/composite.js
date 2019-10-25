import Network from '@endpass/class/Network';

Cypress.Commands.add('mockInitialData', (netId = Network.NET_ID.MAIN) => {
  cy.mockAuthCheck(200);
  cy.mockAuthPermission();
  cy.mockOauthLogin();
  cy.mockOauthConsent();

  cy.mockAuthLogin('emailLink');
  cy.mockAuthSendCode();

  cy.mockRegularPasswordCheck();
  cy.mockRegularPasswordReset();
  cy.mockRegularPasswordResetConfirm();

  cy.mockDocumentsList();
  cy.mockDocumentUpload();
  cy.mockDocumentFrontUpload();

  cy.mockAuthLogout();
  cy.mockAuthRecover();

  cy.mockAccountsV3();
  cy.mockAccountsList();
  cy.mockAccountUpdate();

  cy.mockSettings(netId);
  cy.mockRopstenFaucet();

  cy.mockGasPrices();
  cy.mockEtherPrices();
  cy.mockBalance({
    netId,
  });
});

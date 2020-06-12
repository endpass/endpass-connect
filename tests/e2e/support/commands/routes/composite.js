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
  cy.mockRequiredDocuments();

  cy.mockAuthLogout();
  cy.mockAuthRecover();

  cy.mockSettings(netId);

  cy.mockUserMetric();
  cy.mockUserAddress();
});

import Network from '@endpass/class/Network';

Cypress.Commands.add('mockInitialData', (netId = Network.NET_ID.MAIN) => {
  cy.mockAuthCheck(200);
  cy.mockAuthPermission();
  cy.mockOauthLogin();
  cy.mockOauthConsent();
  cy.mockAuthSignup(200);

  cy.mockAuthLogin('emailLink');
  cy.mockAuthSendCode();

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

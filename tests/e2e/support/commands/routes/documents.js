import {
  documentsList,
  uploadedDocumentId,
  documentFrontUpload,
} from '@fixtures/identity/documents';
import { identityAPIUrl, publicAPIUrl } from '@config';

Cypress.Commands.add('mockDocumentsList', (list = documentsList) => {
  cy.route({
    method: 'GET',
    url: `${identityAPIUrl}/documents`,
    status: 200,
    response: list,
  });

  cy.route({
    method: 'GET',
    url: `${publicAPIUrl}/documents`,
    status: 200,
    response: list,
  });
});

Cypress.Commands.add('mockDocumentUpload', () => {
  cy.route({
    url: `${identityAPIUrl}/documents`,
    method: 'POST',
    response: {
      success: true,
      message: uploadedDocumentId,
    },
    status: 200,
  }).as('documentUpload');
  cy.route({
    url: `${identityAPIUrl}/documents/file/check`,
    method: 'POST',
    response: {},
    status: 200,
  }).as('routeDocumentUploadCheck');
});

Cypress.Commands.add('mockDocumentFrontUpload', () => {
  cy.route({
    url: `${identityAPIUrl}/documents/${uploadedDocumentId}/front`,
    method: 'POST',
    response: {
      success: true,
    },
    status: 200,
  });
  cy.route({
    url: `${identityAPIUrl}/documents/${uploadedDocumentId}/status/upload`,
    method: 'GET',
    response: documentFrontUpload,
    status: 200,
  });
});

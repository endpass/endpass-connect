import {
  document,
  documentsList,
  uploadedDocumentId,
  documentFrontUpload,
  uploadedDocument,
} from '@fixtures/identity/documents';
import { DOC_STATUSES } from '@fixtures/identity/documents/statuses';
import { identityAPIUrl, publicAPIUrl } from '@config';

Cypress.Commands.add('mockDocumentsList', (list = documentsList) => {
  cy.route({
    method: 'GET',
    url: `${identityAPIUrl}/documents`,
    status: 200,
    response: list,
  }).as('routeInternalDocuments');

  cy.route({
    method: 'GET',
    url: `${publicAPIUrl}/documents`,
    status: 200,
    response: list,
  }).as('routeExternalDocuments');
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
    response: {
      success: true,
      message: 'document checked',
    },
    status: 200,
  }).as('routeDocumentUploadCheck');
});

Cypress.Commands.add('mockDocumentFrontUpload', () => {
  cy.route({
    url: `${identityAPIUrl}/documents/${uploadedDocumentId}/confirm`,
    method: 'POST',
    response: {
      success: true,
    },
    status: 200,
  });

  cy.route({
    url: `${identityAPIUrl}/documents/${uploadedDocumentId}/front`,
    method: 'POST',
    response: {
      success: true,
      message: 'upload requested',
    },
    status: 200,
  });

  cy.route({
    url: `${identityAPIUrl}/documents/${uploadedDocumentId}/status/upload`,
    method: 'GET',
    response: documentFrontUpload,
    status: 200,
  });

  cy.route({
    url: `${identityAPIUrl}/documents/${uploadedDocumentId}`,
    method: 'GET',
    response: uploadedDocument,
    status: 200,
  });
});

Cypress.Commands.add('mockRequiredDocuments', () => {
  cy.route({
    url: `${identityAPIUrl}/apps/*/documents/required`,
    method: 'GET',
    response: [document.documentType],
    status: 200,
  }).as('routeCheckDocumentsRequired');
});

Cypress.Commands.add('mockVerifiedDocumentsList', (list = documentsList) => {
  cy.route({
    method: 'GET',
    url: `${identityAPIUrl}/documents?status=${DOC_STATUSES.VERIFIED}`,
    status: 200,
    response: { items: list },
  }).as('routeVerifiedDocuments');
});

Cypress.Commands.add('mockEvents', () => {
  cy.route({
    method: 'GET',
    url: `${identityAPIUrl}/events`,
    status: 200,
    response: {},
  }).as('routeEvents');
});

Cypress.Commands.add(
  'mockSelectedDocuments',
  (selectedDocumentsTypesMap = {}) => {
    cy.route({
      url: `${identityAPIUrl}/apps/*/documents/selected`,
      method: 'GET',
      response: selectedDocumentsTypesMap,
      status: 200,
    }).as('routeSelectedDocuments');

    cy.route({
      url: `${identityAPIUrl}/apps/*/documents/selected`,
      method: 'POST',
      response: {},
      status: 200,
    }).as('routeSaveSelectedDocuments');
  },
);

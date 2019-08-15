import { visitUrl, visitBlockBasic } from '@config';

Cypress.Commands.add('preparePage', () => {
  cy.server();
  cy.authFramePrepare();
  cy.mockInitialData();
});

Cypress.Commands.add('waitPageLoad', () => {
  cy.visit(`${visitUrl}${visitBlockBasic}`);
  cy.preparePage();
});

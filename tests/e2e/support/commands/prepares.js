import { visitUrl, visitBlockBasic } from '@config';

Cypress.Commands.add(
  'waitPageLoad',
  (block = visitBlockBasic, visitOptions) => {
    cy.server();
    cy.visit(`${visitUrl}${block}`, visitOptions);
    cy.authFramePrepare();
    cy.mockInitialData();
  },
);

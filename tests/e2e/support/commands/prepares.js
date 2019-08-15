import { visitUrl, visitBlockBasic } from '@config';

Cypress.Commands.add('preparePage', () => {
  cy.server();
  cy.authFramePrepare();
  cy.mockInitialData();
});

Cypress.Commands.add('waitPageLoad', () => {
  cy.visit(`${visitUrl}${visitBlockBasic}`, {
    onBeforeLoad(win) {
      // eslint-disable-next-line no-param-reassign
      win.e2eLogout = function() {};
      cy.stub(win, 'e2eLogout').as('e2eLogout');
    },
  });
  cy.preparePage();
});

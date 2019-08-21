import Network from '@endpass/class/Network';
import { visitUrl, visitBlockBasic } from '@config';

Cypress.Commands.add('preparePage', netId => {
  cy.server();
  cy.authFramePrepare();
  cy.setupWeb3Provider(netId);
  cy.mockInitialData(netId);
});

Cypress.Commands.add('waitPageLoad', (netId = Network.NET_ID.MAIN) => {
  cy.visit(`${visitUrl}${visitBlockBasic}`, {
    onBeforeLoad(win) {
      // eslint-disable-next-line no-param-reassign
      win.e2eLogout = function() {};
      cy.stub(win, 'e2eLogout').as('e2eLogout');
    },
  });
  cy.preparePage(netId);
});

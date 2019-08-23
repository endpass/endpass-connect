Cypress.Commands.add('openWidget', () => {
  cy.getElementFromWidget('[data-test=balance-label]');
  cy.getElementFromWidget('[data-test=widget-header]').click();
});

Cypress.Commands.add('waitWidgetLoadBalance', () => {
  cy.getElementFromWidget('[data-test=balance-label]');
});

Cypress.Commands.add('openWidget', () => {
  cy.waitWidgetLoadBalance();
  cy.getElementFromWidget('[data-test=widget-header]').click();
});

Cypress.Commands.add('openWidgetMobile', () => {
  cy.getElementFromWidget('[data-test=widget-container] button:eq(0)').click();
  cy.openWidget();
});

Cypress.Commands.add('shouldWidgetBeVisible', () => {
  cy.getElementFromWidget('[data-test=new-account-button]').should(
    'be.visible',
  );
});

Cypress.Commands.add('shouldWidgetBeHidden', () => {
  cy.getElementFromWidget('[data-test=new-account-button]').should(
    'not.be.visible',
  );
});

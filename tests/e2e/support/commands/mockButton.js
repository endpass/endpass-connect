Cypress.Commands.add(
  'mockButtonSubmit',
  (selector = '[data-test=submit-button]') => {
    cy.getAuthFrame()
      .getIframeElement(selector)
      .click();
  },
);

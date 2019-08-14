Cypress.Commands.add('widgetFrameIframe', () => {
  return cy.get('[data-test=widget-frame]');
});

Cypress.Commands.add('widgetFrame', selector => {
  cy.widgetFrameIframe().getIframeElement('[data-test=widget-container]');
  return cy.widgetFrameIframe().getIframeElement(selector);
});

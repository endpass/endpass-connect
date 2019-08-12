Cypress.Commands.add('authFrameContinueRun', () => {
  return cy.window().then(win => {
    cy.log(win);
    return win.e2eBridge.resumeClient();
  });
});

Cypress.Commands.add('authFramePrepare', () => {
  cy.wait(250);
  return cy.window().then(win => {
    cy.log(win);

    return win.e2eBridge.awaitClientPaused();
  });
});

Cypress.Commands.add('authFrameWrapperVisible', () => {
  return cy.get('[data-test=dialog-wrapper][data-visible=true]');
});

Cypress.Commands.add('authFrameWrapperHidden', () => {
  return cy.get('[data-test=dialog-wrapper][data-visible=false]');
});

Cypress.Commands.add('authFrameIframe', () => {
  cy.authFrameWrapperVisible();
  return cy.get('[data-test=dialog-iframe]');
});

Cypress.Commands.add('authFrame', (selector) => {
  return cy.authFrameIframe().getIframeElement(selector);
});

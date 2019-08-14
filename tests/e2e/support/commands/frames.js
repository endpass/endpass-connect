Cypress.Commands.add('authFrameContinueRun', () => {
  return cy.window().then(win => {
    cy.log(win);
    win.document
      .querySelector('[data-test=dialog-iframe]')
      .contentWindow.localStorage.clear();
    return win.e2eBridge.resumeClient();
  });
});

Cypress.Commands.add('authFramePrepare', () => {
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

Cypress.Commands.add('getElementFromAuth', selector => {
  cy.authFrameWrapperVisible();
  return cy.get('[data-test=dialog-iframe]').getIframeElement(selector);
});

Cypress.Commands.add('widgetFrameIframe', () => {
  return cy.get('[data-test=widget-frame]');
});

Cypress.Commands.add('getElementFromWidget', selector => {
  cy.widgetFrameIframe().getIframeElement('[data-test=widget-container]');
  return cy.widgetFrameIframe().getIframeElement(selector);
});

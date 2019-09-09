import Network from '@endpass/class/Network';
import { visitBlockElement } from '@config';

describe('accounts', function() {
  beforeEach(() => {
    cy.waitPageLoad(Network.NET_ID.MAIN, visitBlockElement);
  });

  it('should open account in element', () => {
    cy.authFrameContinueRun();

    cy
      .get('[data-test=dialog-iframe]')
      .getIframeElement('.frame')
      .contains('Endpass Auth bridge');

    cy.get('[data-test=endpass-sign-in-button]').click();

    cy.authFrameWrapperVisible().should('exist');

    cy.getElementFromAuth('[data-test=cancel-button]').click();

    cy.authFrameWrapperHidden().should('exist');
  });
});

import Network from '@endpass/class/Network';
import { address, addressHdChild } from '@fixtures/identity/accounts';

describe('accounts', function() {
  beforeEach(() => {
    cy.waitPageLoad();
  });

  it('should logout from accounts', () => {
    cy.authFrameContinueRun();
    cy.shouldLoggedIn();

    cy.get('[data-test=endpass-form-open-account]').click();

    cy.getElementFromAuth('[data-test=logout-button]').click();

    cy.wait(100);

    cy.get('[data-test=endpass-app-loader]').should('exist');

    cy.waitPageLoad();
    cy.authFrameContinueRun();
    cy.mockAuthCheck(401);

    cy.getElementFromAuth('[data-test=submit-button-auth]').should('exist');
  });

  it('should switch active network', () => {
    cy.authFrameContinueRun();
    cy.shouldLoggedIn();
    cy.get('[data-test=endpass-form-network-name]').should(
      'contain.text',
      Network.DEFAULT_NETWORKS[Network.NET_ID.MAIN].name,
    );

    cy.get('[data-test=endpass-form-open-account]').click();

    cy.getElementFromAuth('[data-test=active-network-select]').select(
      `${Network.NET_ID.ROPSTEN}`,
    );

    cy.getElementFromAuth('[data-test=faucet-button]').should('exist');

    cy.getElementFromAuth('[data-test=submit-button]').click();

    cy.get('[data-test=endpass-form-network-name]').should(
      'contain.text',
      Network.DEFAULT_NETWORKS[Network.NET_ID.ROPSTEN].name,
    );
  });

  it('should request 1ETH by faucet button', () => {
    cy.authFrameContinueRun();
    cy.shouldLoggedIn();
    cy.get('[data-test=endpass-form-network-name]').should(
      'contain.text',
      Network.DEFAULT_NETWORKS[Network.NET_ID.MAIN].name,
    );

    cy.get('[data-test=endpass-form-open-account]').click();

    cy.getElementFromAuth('[data-test=active-network-select]').select(
      `${Network.NET_ID.ROPSTEN}`,
    );

    cy.mockBalance('345000000000000000000', [], Network.NET_ID.ROPSTEN);
    cy.getElementFromAuth('[data-test=faucet-button]').click();
    cy.getElementFromAuth('[data-test=submit-button]').click();

    cy.getElementFromWidget('[data-test=balance-label]').should(
      'contain.text',
      '345.000',
    );

    cy.get('[data-test=endpass-form-open-account]').click();
    cy.getElementFromAuth('[data-test=active-network-select]').select(
      `${Network.NET_ID.MAIN}`,
    );
    cy.getElementFromAuth('[data-test=submit-button]').click();
    cy.getElementFromWidget('[data-test=balance-label]').should(
      'contain.text',
      '1.00000',
    );
  });

  it('should switch accounts', () => {
    cy.authFrameContinueRun();
    cy.shouldLoggedIn();

    cy.get('[data-test=endpass-form-network-name]').should(
      'contain.text',
      Network.DEFAULT_NETWORKS[Network.NET_ID.MAIN].name,
    );

    cy.get('[data-test=endpass-form-open-account]').click();

    cy.getElementFromAuth('[data-test=active-account-select]').should(
      'have.value',
      `${address}`,
    );

    cy.getElementFromAuth('[data-test=active-account-select]').select(
      `${addressHdChild}`,
    );

    cy.getElementFromAuth('[data-test=submit-button]').click();

    cy.get('[data-test=endpass-form-basic-active-account]').contains(
      addressHdChild,
    );
  });
});

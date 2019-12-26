import Network from '@endpass/class/Network';
import { address, addressHdChild } from '@fixtures/identity/accounts';

describe('accounts', () => {
  beforeEach(() => {
    cy.waitPageLoad();
  });

  it('should close dialog without next reopen', () => {
    /**
     * This test checks Queue stucking with the last request
     * It relates to everyone action through connect-auth chain
     */
    cy.authFrameContinueRun();
    cy.shouldLoggedIn();

    cy.get('[data-test=endpass-form-open-account]').click();
    cy.getElementFromAuth('[data-test=cancel-button]').click();

    cy.shouldLoggedIn();
  });

  it('should logout from accounts', () => {
    cy.authFrameContinueRun();

    cy.shouldLoggedIn();

    // widget initialize reload page, soo need wait until widget loaded
    cy.getElementFromWidget('[data-test=widget-header]');

    cy.get('@e2eLogout').should('not.be.called');
    cy.get('[data-test=endpass-form-open-account]').click();

    cy.getElementFromAuth('[data-test=logout-button]').click();

    cy.shouldLogout();
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

    cy.mockBalance({
      balance: '345000000000000000000',
      tokens: [],
      netId: Network.NET_ID.ROPSTEN,
    });

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

    cy.mockBalance({
      balance: '345000000000000000000',
      tokens: [],
      netId: Network.NET_ID.ROPSTEN,
    });
    cy.getElementFromAuth('[data-test=faucet-button]').click();
    cy.getElementFromAuth('[data-test=success-message]').should('exist');
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

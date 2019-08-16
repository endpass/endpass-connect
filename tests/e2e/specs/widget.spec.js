import { v3password, address } from '@fixtures/identity/accounts';
import { etherPrices } from '@fixtures/cryptodata/price';

describe('widget', function() {
  describe('widget features', () => {
    beforeEach(() => {
      cy.waitPageLoad();
    });

    it('should toggle widget', () => {
      cy.authFrameContinueRun();
      cy.shouldLoggedIn();

      cy.getElementFromWidget('[data-test=widget-header]').click();
      cy.getElementFromWidget('[data-test=new-account-button]').should(
        'be.visible',
      );
      cy.getElementFromWidget('[data-test=widget-header]').click();
      cy.getElementFromWidget('[data-test=new-account-button]').should(
        'not.be.visible',
      );
    });

    it('should logout from widget', () => {
      cy.authFrameContinueRun();
      cy.shouldLoggedIn();
      cy.get('@e2eLogout').should('not.be.called');
      cy.getElementFromWidget('[data-test=widget-header]').click();
      cy.getElementFromWidget('[data-test=logout-button]').click();

      cy.shouldLogout();
    });

    it('should create new account and switch between these ones', () => {
      cy.authFrameContinueRun();
      cy.shouldLoggedIn();

      cy.getElementFromWidget('[data-test=widget-header]').click();
      cy.getElementFromWidget('[data-test=account-button]')
        .its('length')
        .should('eq', 2);
      cy.getElementFromWidget('[data-test=new-account-button]').click();
      cy.getElementFromWidget('[data-test=new-account-password-input]').type(
        v3password,
      );
      cy.getElementFromWidget('[data-test=new-account-submit-button]').click();
      cy.getElementFromWidget('[data-test=account-button]')
        .its('length')
        .should('eq', 3);
      cy.get('[data-test=endpass-form-basic-active-account]').should(
        'not.eq',
        address,
      );
      cy.getElementFromWidget('[data-test=account-button]')
        .eq(1)
        .click();
      cy.getElementFromWidget(
        '[data-test=account-button][disabled=true]',
      ).should('not.exist');
      cy.get('[data-test=endpass-form-basic-active-account]').contains(address);
    });

    it('should switch balance from eth to fiat and back', () => {
      cy.authFrameContinueRun();
      cy.shouldLoggedIn();

      cy.getElementFromWidget('[data-fiat-currency]').click();
      cy.getElementFromWidget('[data-test=balance-label]').contains(
        etherPrices.USD,
      );
      cy.getElementFromWidget('[data-fiat-currency]').click();
      cy.getElementFromWidget('[data-test=balance-label]').should(
        'not.to.contain',
        etherPrices.USD,
      );
    });
  });
});

import { v3password, address } from '@fixtures/identity/accounts';
import { etherPrices } from '@fixtures/cryptodata/price';
import { MOBILE_BREAKPOINT } from '@/plugins/WidgetPlugin/WidgetStyles';

describe('widget', () => {
  describe('mobile mode', () => {
    beforeEach(() => {
      cy.viewport(MOBILE_BREAKPOINT - 10, MOBILE_BREAKPOINT - 10);
      cy.waitPageLoad();
    });

    it('should toggle widget on mobile screen', () => {
      cy.authFrameContinueRun();
      cy.shouldLoggedIn();

      cy.openWidgetMobile();
      cy.shouldWidgetBeVisible();
      cy.getElementFromWidget('[data-test=widget-header]').click();
      cy.shouldWidgetBeHidden();
      cy.get('[data-test=endpass-form-network-name]').click();

      cy.openWidgetMobile();
      cy.shouldWidgetBeVisible();
      cy.get('[data-test=endpass-form-network-name]').click();
      cy.shouldWidgetBeHidden();
    });
  });

  describe('desktop mode', () => {
    beforeEach(() => {
      cy.viewport('macbook-15');
      cy.waitPageLoad();
      cy.viewport('macbook-15');
    });

    it('should toggle widget more than one times', () => {
      cy.viewport('macbook-15');
      cy.authFrameContinueRun();
      cy.shouldLoggedIn();

      cy.openWidget();
      cy.shouldWidgetBeVisible();
      cy.getElementFromWidget('[data-test=widget-header]').click();
      cy.shouldWidgetBeHidden();
      cy.getElementFromWidget('[data-test=widget-header]').click();
      cy.shouldWidgetBeVisible();
      cy.getElementFromWidget('[data-test=widget-header]').click();
      cy.shouldWidgetBeHidden();
    });

    it('should logout from widget', () => {
      cy.authFrameContinueRun();
      cy.shouldLoggedIn();
      cy.get('@e2eLogout').should('not.be.called');
      cy.openWidget();
      cy.getElementFromWidget('[data-test=logout-button]').click();

      cy.shouldLogout();
    });

    it('should create new account and switch between these ones', () => {
      cy.authFrameContinueRun();
      cy.shouldLoggedIn();

      cy.openWidget();
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
      cy.wait('@routeEtherPrices');
      cy.getElementFromWidget('[data-fiat-currency]').click();
      cy.getElementFromWidget('[data-test=balance-label]').should(
        'not.to.contain',
        etherPrices.USD,
      );
    });
  });
});

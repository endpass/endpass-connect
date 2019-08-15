import { address, email } from '@fixtures/identity/accounts';
import { visitBlockOauth } from '@config';

describe('oauth', function() {
  describe('oauth login and get data', () => {
    beforeEach(() => {
      cy.waitPageLoad(visitBlockOauth, {
        onBeforeLoad(win) {
          cy.stub(win, 'open', args => {
            const state = args
              .split('&')
              .find(el => el.search('state=') === 0)
              .split('=')[1];

            return {
              closed: false,
              location: {
                hash: '',
                search: `state=${state}&code=code`,
              },
            };
          });
        },
      });
    });

    it('should show accounts list', () => {
      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-oauth-get-accounts-button]').click();

      cy.window()
        .its('open')
        .should('be.called');

      cy.get('[data-test=endpass-app-loader]').should('not.exist');
      cy.authFrameWrapperHidden().should('exist');
      cy.get('[data-test=endpass-oauth-accounts-list]')
        .eq(0)
        .should('contain.text', address);
    });

    it.only('should show account email', () => {
      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-oauth-get-email-button]').click();

      cy.window()
        .its('open')
        .should('be.called');

      cy.get('[data-test=endpass-app-loader]').should('not.exist');
      cy.authFrameWrapperHidden().should('exist');
      cy.get('[data-test=endpass-oauth-user-email]').should(
        'contain.text',
        email,
      );
    });
  });
});

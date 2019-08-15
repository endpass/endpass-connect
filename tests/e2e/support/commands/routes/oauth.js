import { v3, email } from '@fixtures/identity/accounts';
import { responseSuccess } from '@fixtures/response';
import { identityAPIUrl } from '@config';

Cypress.Commands.add(
  'mockOauthLogin',
  (redirect = 'consent?consent_challenge=consent_challenge') => {
    cy.route({
      url: `${identityAPIUrl}/oauth/login**`,
      method: 'GET',
      status: 200,
      response: {
        email,
        keystore: v3,
      },
    });
    cy.route({
      url: `${identityAPIUrl}/oauth/login`,
      method: 'POST',
      status: 200,
      response: {
        redirect,
      },
    });

    cy.route({
      url: `${identityAPIUrl}/oauth/token`,
      method: 'POST',
      status: 200,
      response: responseSuccess,
    });
  },
);

Cypress.Commands.add(
  'mockOauthConsent',
  (redirect = 'consent', response = {}) => {
    cy.route({
      url: `${identityAPIUrl}/oauth/consent/**`,
      method: 'GET',
      status: 200,
      response,
    });

    cy.route({
      url: `${identityAPIUrl}/oauth/consent`,
      method: 'POST',
      status: 200,
      response: {
        redirect,
      },
    });
  },
);

import { email } from '@fixtures/identity/user';
import { responseSuccess, oauthTokenResponse } from '@fixtures/response';
import { userEmailReadScope } from '@fixtures/scopes';
import { CURRENT_STATE_KEY, SOP_EMULATION_FLAG } from '@fixtures/system';
import { identityAPIUrl, publicAPIUrl, authUrl } from '@config';

Cypress.Commands.add(
  'mockOauthLogin',
  (
    redirect = '/prepare.html?redirect=/public/consent&consent_challenge=consent_challenge',
  ) => {
    cy.route({
      url: `${identityAPIUrl}/oauth/login**`,
      method: 'GET',
      status: 200,
      response: {
        email,
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
      url: `${publicAPIUrl}/oauth/token`,
      method: 'POST',
      status: 200,
      response: oauthTokenResponse,
    });
  },
);

Cypress.Commands.add('mockOauthConsent', (redirect = '/public/consent?content_challenge=consent_challenge', response) => {
  cy.route({
    url: `${identityAPIUrl}/oauth/consent/**`,
    method: 'GET',
    status: 200,
    response: response || {
      skip: false,
      requested_scope: [userEmailReadScope],
    },
  }).as('routeMockOauthConsentGet');

  cy.route({
    url: `${identityAPIUrl}/oauth/consent`,
    method: 'POST',
    status: 200,
    response: {
      redirect,
    },
  });
});

Cypress.Commands.add('mockOauthConsentRedirectToConfirmation', () => {
  const state = Cypress.env(CURRENT_STATE_KEY) || 'state';

  cy.mockOauthConsent(`${authUrl}?state=${state}&code=code&${SOP_EMULATION_FLAG}`);
});

Cypress.Commands.add('mockOauthConsentForSkip', () => {
  const state = Cypress.env(CURRENT_STATE_KEY) || 'state';

  cy.mockOauthConsent(null, {
    requested_scope: [userEmailReadScope],
    skip: true,
    redirect_url: `${authUrl}?state=${state}&code=code&${SOP_EMULATION_FLAG}`,
  });
});

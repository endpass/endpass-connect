import { responseSuccess } from '@fixtures/response';
import { otpCode } from '@fixtures/identity/user';
import { identityAPIUrl, visitUrl, visitBlockBasic } from '@config';

Cypress.Commands.add('mockAuthPermission', () => {
  cy.route({
    url: `${identityAPIUrl}/auth/permission`,
    method: 'GET',
    status: 200,
    response: {
      keystore: responseSuccess,
    },
  }).as('routeAuthPermissionGet');

  cy.route({
    url: `${identityAPIUrl}/auth/permission`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  }).as('routeAuthPermissionPost');
});

Cypress.Commands.add(
  'mockAuthLogin',
  (
    challengeType = 'emailLink',
    redirectUri = `${visitUrl}${visitBlockBasic}`,
    response = null
  ) => {
    if (!response) {
      response = {
        success: true,
        challenge: {
          challengeType,
        },
        remembered: false,
        hasPhone: false,
        hasPassword: false,
      };
    }

    cy.route({
      url: `${identityAPIUrl}/auth?redirect_uri=${redirectUri}`,
      method: 'POST',
      status: 200,
      response,
    }).as('routeLoginAuthRedirect')

    cy.route({
      url: `${identityAPIUrl}/auth`,
      method: 'POST',
      status: 200,
      response,
    }).as('routeLoginAuthPost');

    cy.route({
      url: `${identityAPIUrl}/auth/token`,
      method: 'POST',
      status: 200,
      response: responseSuccess,
    }).as('routeLoginAuthToken');
  },
);

Cypress.Commands.add('mockAuthLoginForExistingUser', () => {
  cy.mockAuthLogin('emailLink', visitUrl, {
    success: true,
    challenge: {
      challengeType: 'emailLink',
    },
    remembered: false,
    hasPhone: true,
    hasPassword: true,
  });
});

Cypress.Commands.add('mockAuthRecover', () => {
  cy.route({
    url: `${identityAPIUrl}/auth/recover?email=**`,
    method: 'GET',
    status: 200,
    response: {
      success: true,
      message: '71d45eb3-480b-4034-9278-9a17eed20d49',
    },
  });
  cy.route({
    url: `${identityAPIUrl}/auth/recover`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });
});

Cypress.Commands.add('mockAuthSendCode', (status = 200) => {
  cy.route({
    method: 'POST',
    url: `${identityAPIUrl}/auth/code`,
    status,
    response: { code: otpCode },
  }).as('routeAuthSendCode');
});

Cypress.Commands.add('mockAuthSignup', status => {
  let response = {
    code: status,
    message: 'Error',
    id: 'ip-10-10-11-191.ec2.internal/ZAT9VU6zDS-004256',
    error: 'error',
  };

  if (status === 200) {
    response = {
      csrfToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTQ4MzM5MTMsImlzcyI6ImVuZHBhc3MiLCJzdWIiOiJlMzg0NjJiNC03NzhiLTQ2YTYtOThmNS04ZWYzNjJhNTZmNmEiLCJvdHAiOmZhbHNlLCJzbXNDb2RlIjpmYWxzZSwiYXBwSW52aXRlIjpmYWxzZSwieHNyZlRva2VuIjoiNzVlYzQ3OWEtYjY4OS00Y2Q4LWJhYjctYTU5ZjhmMzNjODI4In0.SRscFKKtU6PBXSWDqM8ssadQgZyRJvVWufDDQUgOzB4',
      expiresIn: 360000,
      success: true,
    };
  }

  cy.route({
    method: 'POST',
    url: `${identityAPIUrl}/auth/signup`,
    status,
    response,
  }).as('routeAuthSignup');
});

Cypress.Commands.add('mockAuthCheck', status => {
  const hash = status === 200 ? 'hash' : '';
  cy.route({
    method: 'GET',
    url: `${identityAPIUrl}/auth/check`,
    status,
    response: {
      hash,
    },
  }).as('routeAuthCheck');
});

Cypress.Commands.add('mockAuthLogout', () => {
  cy.route({
    url: `${identityAPIUrl}/logout`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  }).as('routeAuthLogout');
});

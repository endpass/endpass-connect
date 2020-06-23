import Network from '@endpass/class/Network';
import { responseSuccess } from '@fixtures/response';
import settings from '@fixtures/identity/settings';
import { email } from '@fixtures/identity/user';
import { identityAPIUrl, publicAPIUrl } from '@config';

Cypress.Commands.add('mockSettings', (netId = Network.NET_ID.MAIN) => {
  cy.route({
    url: `${identityAPIUrl}/settings`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });

  cy.route({
    url: `${identityAPIUrl}/settings`,
    method: 'GET',
    status: 200,
    response: {
      ...settings,
      net: netId,
    },
  });

  cy.route({
    url: `${identityAPIUrl}/user/seed`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });

  cy.route({
    url: `${publicAPIUrl}/user`,
    method: 'GET',
    status: 200,
    response: {
      email,
    },
  });
});

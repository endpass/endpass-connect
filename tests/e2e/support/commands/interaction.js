import Network from '@endpass/class/Network';
import path from 'path';
import { visitUrl, visitBlockBasic, authUrl } from '@config';

/**
 * Converts fixture to Blob. All file types are converted to base64 then
 * converted to a Blob using Cypress expect application/json. Json files are
 * just stringified then converted to a blob (fixes issue invalid Blob issues).
 * @param {String} fileUrl - The file url to upload
 * @param {String} type - content type of the uploaded file
 * @return {Promise} Resolves with blob containing fixture contents
 */
function getFixtureBlob(fileUrl, type) {
  if (type === 'application/json' || path.extname(fileUrl) === 'json') {
    return cy
      .fixture(fileUrl)
      .then(JSON.stringify)
      .then(jsonStr => new Blob([jsonStr], { type: 'application/json' }));
  }

  return cy.fixture(fileUrl, 'base64').then(Cypress.Blob.base64StringToBlob);
}

/**
 * Uploads a file to an input
 * @memberOf Cypress.Chainable#
 * @name uploadFile
 * @function
 * @param {String} selector - element to target
 * @param {String} fileUrl - The file url to upload
 * @param {String} type - content type of the uploaded file
 */
Cypress.Commands.add('uploadFile', (selector, fileUrl, type = '') =>
  cy.getElementFromAuth(selector).then(subject =>
    getFixtureBlob(fileUrl, type).then(blob => {
      const changeEvent = new Event('change');
      const el = subject[0];
      const doc = el.ownerDocument;
      const win = doc.defaultView || doc.parentWindow;
      const name = fileUrl.split('/').pop();
      const testFile = new win.File([blob], name, { type: blob.type });
      const dataTransfer = new win.DataTransfer();

      dataTransfer.items.add(testFile);
      el.files = dataTransfer.files;
      el.dispatchEvent(changeEvent);
      // sometimes event fired with empty files
      el.files = dataTransfer.files;
      return subject;
    }),
  ),
);

Cypress.Commands.add('preparePage', netId => {
  cy.server();
  cy.authFramePrepare();
  cy.mockInitialData(netId);
});

Cypress.Commands.add(
  'waitPageLoad',
  (netId = Network.NET_ID.MAIN, visitBlock = visitBlockBasic) => {
    cy.visit(`${visitUrl}${visitBlock}`, {
      onBeforeLoad(win) {
        // eslint-disable-next-line no-param-reassign
        win.e2eLogout = function() {};
        cy.stub(win, 'e2eLogout').as('e2eLogout');
      },
    });
    cy.preparePage(netId);
  },
);

Cypress.Commands.add('mockOnceOauthState', (url = `${authUrl}?state=${state}&code=code`) => {
  cy.mockOnceIframeSrc(
    'https://api-dev.endpass.com/v1/oauth/auth?client_id=',
    src => {
      const state = src
        .split('&')
        .find(el => el.search('state=') === 0)
        .split('=')[1];
      return url;
    },
  );
});

Cypress.Commands.add('mockOnceOauthStateForSignIn', () => {
  cy.mockOnceOauthState(`${authUrl}/prepare.html?login_challenge=8eb1975e248d45378ccfb21f0ba9adf4&redirect=%2Fpublic%2Flogin`);
});

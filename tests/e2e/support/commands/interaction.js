import Network from '@endpass/class/Network';
import path from 'path';
import { visitUrl, visitBlockBasic } from '@config';

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
    getFixtureBlob(fileUrl, type).then(blob =>
      cy.window().then(win => {
        const changeEvent = new Event('change');
        const name = fileUrl.split('/').pop();
        const testFile = new win.File([blob], name, { type: blob.type });
        const dataTransfer = new win.DataTransfer();
        const el = subject[0];

        dataTransfer.items.add(testFile);
        el.files = dataTransfer.files;
        el.dispatchEvent(changeEvent);

        return subject;
      }),
    ),
  ),
);

Cypress.Commands.add('preparePage', netId => {
  cy.server();
  cy.authFramePrepare();
  cy.setupWeb3Provider(netId);
  cy.mockInitialData(netId);
});

Cypress.Commands.add('waitPageLoad', (netId = Network.NET_ID.MAIN, visitBlock = visitBlockBasic) => {
  cy.visit(`${visitUrl}${visitBlock}`, {
    onBeforeLoad(win) {
      // eslint-disable-next-line no-param-reassign
      win.e2eLogout = function() {};
      cy.stub(win, 'e2eLogout').as('e2eLogout');
    },
  });
  cy.preparePage(netId);
});

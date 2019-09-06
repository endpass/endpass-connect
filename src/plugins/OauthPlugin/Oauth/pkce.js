// @ts-check
// PKCE HELPER FUNCTIONS

/**
 * Generate a secure random string using the browser crypto functions
 * @return {string}
 */
function generateRandomString() {
  const array = new Uint32Array(28);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec => `0${dec.toString(16)}`.substr(-2)).join('');
}

/**
 * Calculate the SHA256 hash of the input text.
 * Returns a promise that resolves to an ArrayBuffer
 * @param {string} plain
 * @return {PromiseLike<ArrayBuffer>}
 */
function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

/**
 * Base64-urlencodes the input
 * @param {ArrayBuffer} buffer
 * @return {string}
 */
function base64urlencode(buffer) {
  // Convert the ArrayBuffer to string using Uint8 array to convert to what btoa accepts.
  // btoa accepts chars only within ascii 0-255 and base64 encodes them.
  // Then convert the base64 encoded to base64url encoded
  //   (replace + with -, replace / with _, trim trailing =)

  // @ts-ignore
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Return the base64-urlencoded sha256 hash for the PKCE challenge
 * @param {string} v
 * @return {Promise<string>}
 */
async function challengeFromVerifier(v) {
  const hashed = await sha256(v);
  return base64urlencode(hashed);
}

export default {
  challengeFromVerifier,
  generateRandomString,
};

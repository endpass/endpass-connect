module.exports = on => {
  on('before:browser:launch', (browser = {}, args) => {
    if (
      browser.name === 'chrome' ||
      browser.name === 'chromium' ||
      browser.name === 'canary'
    ) {
      args.push('--window-size=1920,1080');
    }
    return args;
  });
};

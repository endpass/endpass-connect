const path = require('path');
const ghPages = require('gh-pages');
const pkg = require('../package.json');

console.info('Publishing started! 🚀');

ghPages.publish(path.resolve(__dirname, '../dist'), err => {
  if (err) {
    console.error('Publishing failed! 💥');
    console.error(err);
  } else {
    console.info('Successfully published! ✨');
    console.info(`Check result here: ${pkg.homepage}`);
  }
});

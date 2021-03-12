const path = 'dist/image-capture/index.html';
const packageInfo = require('../package.json');

const insertScript = require('../../vncho-lib/tools/google-analytics-insert.js');
const replaceVersion = require('../../vncho-lib/tools/version-replace.js');


insertScript(path);
replaceVersion(path, packageInfo.version);
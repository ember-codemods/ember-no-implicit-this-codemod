const Cache = require('sync-disk-cache');
const getRepoInfo = require('git-repo-info');

const gitInfo = getRepoInfo();
const cache = new Cache(`no-implicit-this-codemod-${gitInfo.sha}-${process.cwd()}`);

module.exports = cache;
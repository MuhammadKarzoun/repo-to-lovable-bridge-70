const configs = require("./src/configs");
const pluginWebpack = require('@octobots/ui/plugin.webpack.config');

module.exports = pluginWebpack(configs);
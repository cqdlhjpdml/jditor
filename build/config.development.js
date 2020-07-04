const merge = require('webpack-merge')

module.exports = merge(require('./config.base.js'), {
  mode: 'development',
  devtool:"inline-source-map",
  watch: true

  // All webpack configuration for development environment will go here
})
// Global CLI Config, refer to https://cli.vuejs.org/config/#global-cli-config
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? './'
    : '/'
}

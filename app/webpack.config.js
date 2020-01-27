const path = require('path')

module.exports = (env, argv) => {
  return {
    mode: argv.mode || 'development',
    watch: argv.mode !== 'production',
    stats: 'minimal',
    devtool: argv.mode !== 'production' ? 'source-map' : 'eval',
    target: 'electron-renderer',
    resolve: {
      extensions: ['.ts', '.scss', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          include: [path.resolve(__dirname, 'src')],
          use: [
            {
              loader: 'ts-loader',
            },
          ],
        },
        {
          test: /\.scss$/,
          include: [path.resolve(__dirname, 'src/assets')],
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
              options: {
                url: false,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: () => [
                  require('autoprefixer')({grid: true, remove: false}),
                ],
              },
            },
            {
              loader: 'sass-loader',
            },
          ],
        },
      ],
    },
  }
}

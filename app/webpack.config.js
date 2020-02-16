const path = require('path')

module.exports = (env, argv) => {
  const config = []
  if (argv.mode !== 'production') {
    const cssConfig = require('./webpack.css.config')
    config.push(cssConfig(env, argv))
  }

  config.push({
    mode: argv.mode || 'development',
    watch: argv.mode !== 'production',
    devtool: argv.mode !== 'production' ? 'source-map' : 'false',
    target: 'electron-renderer',
    entry: {
      'main': './src/index.ts',
      'editor': './src/editors/webview.ts',
    },
    resolve: {
      extensions: ['.ts', '.scss', '.js', '.css'],
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            {
              loader: 'css-loader',
            },
          ],
        },
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
  })

  return config
}

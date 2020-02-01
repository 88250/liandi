const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (env, argv) => {
  return [{
    mode: argv.mode || 'development',
    watch: argv.mode !== 'production',
    entry: {
      'components': './src/assets/scss/components.scss',
    },
    resolve: {
      extensions: ['.scss'],
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          include: [path.resolve(__dirname, 'src/assets')],
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader', // translates CSS into CommonJS
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
              loader: 'sass-loader', // compiles Sass to CSS
            },
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
      })
    ],
  }, {
    mode: argv.mode || 'development',
    watch: argv.mode !== 'production',
    stats: 'minimal',
    devtool: argv.mode !== 'production' ? 'source-map' : 'eval',
    target: 'electron-renderer',
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
  }]
}

const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (env, argv) => {
  return {
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
      }),
    ],
  }
}

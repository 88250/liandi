/**
 * @fileoverview demo.
 *
 * @author <a href="http://vanessa.b3log.org">Liyuan Li</a>
 * @version 0.3.0.0, Sep 3, 2019
 */

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const pkg = require('./package.json')

module.exports = {
  mode: 'development',
  watch: true,
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'vditore/demo/dist'),
  },
  entry: {
    'index.js': './vditore/demo/index.ts',
  },
  resolve: {
    extensions: ['.js', '.ts', '.png', '.scss'],
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        include: [path.resolve(__dirname, 'vditore/src/assets')],
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
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
      {
        test: /\.png$/,
        include: [path.resolve(__dirname, './src/assets/images')],
        use: [
          'file-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['index.js'],
      filename: './index.html',
      template: './vditore/demo/index.html',
    }),
    new webpack.DefinePlugin({
      VDITOR_VERSION: JSON.stringify(pkg.version),
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, '.'),
    port: 9000,
    host: '0.0.0.0',
  },
}

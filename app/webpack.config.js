const path = require('path')
const webpack = require('webpack')
const pkg = require('./package.json')

module.exports = (env, argv) => {
  return [
    {
      mode: argv.mode || 'development',
      watch: argv.mode !== 'production',
      devtool: argv.mode !== 'production' ? 'source-map' : 'false',
      target: 'electron-renderer',
      entry: {
        'main': './src/index.ts',
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
            include: [
              path.resolve(__dirname, 'src'),
              path.resolve(__dirname, 'vditor')],
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
      plugins: [
        new webpack.DefinePlugin({
          VDITOR_VERSION: JSON.stringify(pkg.version),
        }),
      ],
    }]

}

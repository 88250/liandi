const path = require('path')

module.exports = (env, argv) => {
  return {
    mode: argv.mode || 'development',
    watch: argv.mode !== 'production',
    stats: 'minimal',

    // Enable sourcemaps for debugging webpack's output.
    devtool: 'source-map',
    target: 'electron-renderer',
    resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: ['.ts', '.tsx', '.scss'],
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

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
    },
  }
}

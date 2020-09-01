const webpack = require('webpack');
const cssnano = require('cssnano');
const postcssUrl = require('postcss-url');
const postcssEasyImport = require('postcss-easy-import');
const postcssPresetEnv = require('postcss-preset-env');
const { WebPlugin } = require('web-webpack-plugin');
const SuppressChunksPlugin = require('suppress-chunks-webpack-plugin').default;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// Make relative path
const relative = path => require('path').resolve(__dirname, path);

module.exports = (_, options) => {
  const dev = !options || options.mode === 'development';

  return {
    // Minimal console output
    stats: 'minimal',

    // Source maps
    devtool: dev ? 'inline-cheap-module-source-map' : false,

    // Webpack scope hoisting is broken
    optimization: { concatenateModules: false },

    // Don't watch node_modules
    watchOptions: { ignored: '/node_modules/' },

    // Toolbar & iFrame
    entry: {
      iframe: relative('src/iframe'),
      prismic: relative('src/toolbar'),
      toolbar: relative('src/toolbar/toolbar'),
    },

    // Output to prismic app
    output: {
      path: relative('build')
    },

    // Helper Functions
    resolve: {
      alias: {
        '~': relative('src'),
        '@common': relative('src/common'),
        '@toolbar': relative('src/toolbar'),
        '@iframe': relative('src/iframe'),
        '@toolbar-service': relative('src/toolbar-service'),
        react: 'preact-compat',
        'react-dom': 'preact-compat',
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(!dev),
        PRISMIC_CDN_HOST: process.env.PRISMIC_CDN_HOST ?
          JSON.stringify(process.env.PRISMIC_CDN_HOST) :
            dev ?
              JSON.stringify('http://localhost:8081') :
                JSON.stringify('https://prismic.io')
      }),
      // Ensure working regenerator-runtime
      new webpack.ProvidePlugin({
        regeneratorRuntime: 'regenerator-runtime',
        h: ['preact', 'h'],
      }),
      // Expose environment variables
      new webpack.EnvironmentPlugin(['npm_package_version']),
      // Output HTML for iFrame
      new WebPlugin({
        filename: 'iframe.html',
        template: relative('src/iframe/index.html'),
      }),
      new SuppressChunksPlugin(['iframe']),
      new BundleAnalyzerPlugin({
        openAnalyzer: false
      }),
    ],

    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            // `import foo.css` gets the raw text to inject anywhere
            'raw-loader',
            {
              // PostCSS
              loader: 'postcss-loader',
              options: {
                sourceMap: 'inline',
                plugins: () => [
                  postcssEasyImport(),
                  postcssUrl({ url: 'inline' }),
                  postcssPresetEnv({
                    features: {
                      'nesting-rules': true,
                      'color-mod-function': true,
                    },
                  }),
                  cssnano(),
                ],
              },
            },
          ],
        },

        // Babel
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },

        // ESLint
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['eslint-loader']
        },

        // DataURI Image Loader
        {
          test: /\.(svg|jpg)$/,
          use: 'url-loader',
        },
      ],
    },
  };
};

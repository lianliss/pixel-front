// Generated using webpack-cli https://github.com/webpack/webpack-cli

const os = require('os');
const {URL} = require('url');
const path = require('path');
const webpack = require('webpack');
const packageJSON = require('./package.json');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
//const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
//const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const sassModuleRegex = /\.module\.(scss|sass)$/;

const isTrue = prop => [true, 'true'].includes(prop);
const PATHNAME = 'dist/';
const PORT = process.env.PORT || process.env.DEV_PORT || 8080;
const DEV_PORT = process.env.DEV_PORT || PORT;
const NODE_ENV = process.env.NODE_ENV || 'develop';
const DEV_MODE = isTrue(process.env.DEV_MODE) || NODE_ENV !== 'production';
const LOCAL_URL = new URL(`http://${os.hostname()}:${PORT}`).href;
const API_URL = new URL(process.env.API_URL || process.env.ROOT_URL || LOCAL_URL).href;
const DIST_URL = process.env.DIST_URL || new URL(PATHNAME, API_URL).href;
const VERSION = packageJSON.version;
const STORAGE_URL = process.env.STORAGE_URL;
const BUILD_PATH = [__dirname, PATHNAME].join('/');

const WEBPACK_ENV = {
		PORT: `"${PORT || DEV_PORT}"`,
		//API_URL: `"${API_URL}"`, // Backend API url
    STORAGE_URL: `"${STORAGE_URL}"`, // Data source url
		DIST_URL: `"${DIST_URL}"`, // Final scripts location
		VERSION: `"${VERSION}"`,
		DEV_MODE: `"${DEV_MODE}"`,
		NODE_ENV: `"${NODE_ENV}"`,
    BUILT_AT: `"${new Date().toUTCString()}"`,
};

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = MiniCssExtractPlugin.loader;

const config = {
  devtool: !isProduction ? 'source-map' : false,
  target: isProduction ? ['web', 'es5'] : 'web',
  entry: {
    'styles': [__dirname + '/styles/link.scss'],
    'app': [__dirname + '/app/index.jsx'],
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name]chunk[hash].js',
    path: __dirname + '/dist',
    publicPath: isProduction ? '/dist/' : '/',
    clean: true,
  },
  devServer: {
    port: DEV_PORT,
    compress: true,
    host: `localhost`,
    hot: 'only',
    historyApiFallback: true,
    watchFiles: ['app/**/*', 'styles/**/*'],
  },
  plugins: [
    new webpack.DefinePlugin({'process.env': WEBPACK_ENV}),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new HtmlWebpackPlugin({
      template: "index.html",
      hash: true,
    }),
    new MiniCssExtractPlugin(),

    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: [
          path.resolve(__dirname, 'app/'),
          path.resolve(__dirname, 'node_modules/dom7'),
          path.resolve(__dirname, 'node_modules/query-string'),
          path.resolve(__dirname, 'node_modules/lodash-es'),
        ],
        exclude: [
          /[\\/]node_modules[\\/](?!(dom7|query-string|lodash-es)[\\/])/,
        ],
        use: {
          loader: 'babel-loader',
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: sassModuleRegex,
        use: [
          isProduction ? stylesHandler : 'style-loader',
          "css-loader", "postcss-loader", "sass-loader"],
      },
      {
        test: sassModuleRegex,
        use: [
          isProduction ? stylesHandler : 'style-loader',
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: {
                getLocalIdent: getCSSModuleLocalIdent,
                exportLocalsConvention : 'dashes',
              },
            },
          },
          "postcss-loader",
          {
            loader: "sass-loader",
            options: {
              sourceMap: !isProduction,
              //getLocalIdent: getCSSModuleLocalIdent,
            }
          }],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    modules: ['lib', 'node_modules'],
    extensions: ['.js', '.jsx', '.json', '.scss'],
    alias: {
      app: __dirname + '/app',
      assets: __dirname + '/app/assets',
      root: __dirname + '/app/root',
      utils: __dirname + '/app/utils',
      const: __dirname + '/app/const',
      schemas: __dirname + '/app/const/schemas',
      styles: __dirname + '/styles',
      lib: __dirname + '/app/lib',
      ui: __dirname + '/app/lib/ui',
      data: __dirname + '/app/lib/data',
      calls: __dirname + '/app/calls',
      icons: __dirname + '/app/utils/icons',
      //async: __dirname + '/app/utils/async',
      slices: __dirname + '/app/store/slices',
      services: __dirname + '/app/services',
    },
    fallback: {
      fs: false,
      'util': require.resolve('util/'),
      'url': require.resolve(`url/`),
      'assert': require.resolve('assert/'),
      "crypto": require.resolve("crypto-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "https": require.resolve("https-browserify"),
      "http": require.resolve("stream-http"),
      'stream': require.resolve('stream-browserify'),
      'buffer': require.resolve('buffer'),
      'zlib': require.resolve('browserify-zlib'),
    }
  },
  optimization: !isProduction ? {} : {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: {
          pure_funcs: [
            'console.log',
            'console.info',
            'console.debug',
            'console.warn'
          ]
        }
      }
    })],
  },
};

console.log({WEBPACK_ENV});
console.log('Output', config.output);

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
    config.plugins.push(new BundleAnalyzerPlugin());
  }
  return config;
};

var path = require('path');
var webpack = require('webpack');
const output = path.join(__dirname, '../../lib/client');
var config = require('config');
var webpackConfig = {
  devtool: 'eval',
  entry: {
    whm: 'webpack-hot-middleware/client',
    main: ['./src/client/index.jsx']
  },
  output: {
    path: output,
    filename: '[name].js',
    publicPath: '/js/'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.CommonsChunkPlugin('common.js'),
    new webpack.ProvidePlugin({
      'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
    }),
    new webpack.DefinePlugin({
      connectorPath: config.get('Hoist.filePaths.connectors')
    })
  ],
  node: {
    fs: "empty"
  },
  module: {
    loaders: [{
      test: /\.js[x]?$/,
      loader: 'babel',
      query: {
        "presets": ["es2015", "react", "stage-0"],
        "plugins": []
      },
      exclude: /(node_modules)/,
    }, {
      test: require.resolve("react"),
      loader: "expose?React"
    }, {
      test: require.resolve("@hoist/ui"),
      loader: "expose?UI"
    }, {
      test: /\.scss$/,
      loaders: ["style", "css?sourceMap", "resolve-url?sourceMap", "sass?sourceMap"]
    }, {
      test: /\.png$/,
      loader: "url-loader?limit=100000"
    }, {
      test: /\.jpg$/,
      loader: "file-loader"
    }, {
      test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      loader: 'url-loader'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.scss', '.jsx'],
    modulesDirectories: ['node_modules', config.get('Hoist.filePaths.connectors')],
    alias: {
      connectors: path.resolve(process.cwd(), config.get('Hoist.filePaths.connectors'))
    }
  }
};
webpackConfig.debug = true;
if (config.get('Hoist.webpack.optimize')) {
  webpackConfig.plugins = webpackConfig.plugins.concat([
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      },
      '__DEVTOOLS__': false,
      build: JSON.stringify('production'),
      connectorPath: config.get('Hoist.filePaths.connectors')
    })
  ]);
} else {

  webpackConfig.assets = {
    noInfo: true,
    lazy: false,
    watchOptions: {
      aggregateTimeout: 300,
      poll: true
    },
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true
    }
  }
  webpackConfig.module.loaders[0].query.plugins = [
    ["react-transform", {
      "transforms": [{
        "transform": "react-transform-hmr",
        "imports": ["react"],
        "locals": ["module"],
      }, {
        "transform": "react-transform-catch-errors",
        "imports": ["react", "redbox-react"],
      }],
    }]
  ]
  webpackConfig.plugins = webpackConfig.plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin('common.js'),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      },
      '__DEVTOOLS__': true,
      build: JSON.stringify('development'),
      connectorPath: config.get('Hoist.filePaths.connectors')
    })
  ]);
}

module.exports = webpackConfig;

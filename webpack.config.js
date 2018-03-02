
const webpack = require('webpack'); //to access built-in plugins
const path = require('path')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')


const config = {
    entry: './assets/index.js',
    output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
    },
    module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader', exclude: /node_modules/, },
      { test: /\.json$/, use: 'json-loader', exclude: /node_modules/, },
      { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/, },
      { test: /\.(woff2?|ttf|svg|png|eot|jpg)(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader', exclude: /node_modules/, },
      { test: /\.css$/, use: ['style-loader', 'css-loader'], exclude: /node_modules/, },
    ]
    },
    plugins: [
        new UglifyJSPlugin(),
        // new HtmlWebpackPlugin({template: './public/index.html'})
      ]
};

module.exports = config

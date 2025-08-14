const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.template.html',
      filename: 'index.html',
      inject: true,
      minify: false, // We'll handle minification in production config
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'terms.html', to: 'terms.html' },
        { from: 'privacy.html', to: 'privacy.html' },
        { from: 'legal-docs', to: 'legal-docs' },
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'src/sw.js', to: 'sw.js' },
      ],
    }),
  ],
};
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env) => {
  const shouldObfuscate = env && env.obfuscate === 'true';
  
  // Remove HtmlWebpackPlugin from common config to avoid conflicts
  const commonWithoutHtml = {
    ...common,
    plugins: common.plugins.filter(plugin => plugin.constructor.name !== 'HtmlWebpackPlugin')
  };
  
  const config = merge(commonWithoutHtml, {
    mode: 'production',
    devtool: false, // No source maps in production
    output: {
      filename: 'js/[name].js?v=[contenthash:8]',
      chunkFilename: 'js/[name].chunk.js?v=[contenthash:8]',
      assetModuleFilename: 'assets/[name][ext]?v=[contenthash:8]',
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'css/[name].css?v=[contenthash:8]',
        chunkFilename: 'css/[name].chunk.css?v=[contenthash:8]',
      }),
      // Override HtmlWebpackPlugin to enable minification
      new HtmlWebpackPlugin({
        template: './src/shell.template.html',
        filename: 'index.html',
        inject: true,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
    ],
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true, // Remove console logs
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
            },
            mangle: {
              safari10: true,
            },
            format: {
              comments: false, // Remove all comments
            },
          },
          extractComments: false,
        }),
      ],
      splitChunks: {
        chunks: 'all',
        name: false,
        cacheGroups: {
          // Split vendor code
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 10,
            enforce: true,
          },
          // Split utilities/helpers
          common: {
            minChunks: 2,
            priority: 5,
            name: 'common',
            reuseExistingChunk: true,
          },
          // Split styles
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true,
          },
        },
      },
      runtimeChunk: 'single', // Extract webpack runtime to separate file
    },
  });

  // Add obfuscation if requested
  if (shouldObfuscate) {
    config.plugins.push(
      new WebpackObfuscator({
        rotateStringArray: true,
        stringArray: true,
        stringArrayThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: true,
        debugProtectionInterval: 2000,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false,
        selfDefending: true,
        unicodeEscapeSequence: false,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        numbersToExpressions: true,
        simplify: true,
        shuffleStringArray: true,
        splitStrings: true,
        splitStringsChunkLength: 10,
        stringArrayEncoding: ['base64'],
        stringArrayWrappersCount: 2,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersType: 'function',
        transformObjectKeys: true,
      })
    );
  }

  return config;
};
const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: process.env.NODE_ENV === 'production' ? '#cheap-module-source-map' : false,
  // エントリーポイントの設定
  entry: {
    index: [path.resolve(__dirname, './js/index.js')]
  },
  // 出力の設定
  output: {
    path: path.resolve(__dirname, '../js/'),
    filename: '[name].bundle.js'
  },
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        uglifyOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  },
  // ローダーの設定
  module: {
    rules: [
      {
        // ローダーの対象ファイル
        test: /\.js$/,
        // ローダーの対象から外すディレクトリ
        exclude: /node_modules/,
        // 利用するローダー
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      ie: 11
                    },
                    // 必要な箇所にだけpolyfillを読み込む設定
                    useBuiltIns: 'usage',
                    corejs: 3
                  }
                ]
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [new webpack.EnvironmentPlugin({ NODE_ENV: 'development' })]
};

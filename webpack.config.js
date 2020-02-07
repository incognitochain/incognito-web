const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

require('dotenv').config();

const templateGen = [
  new HtmlWebpackPlugin({
    template: 'src/template/home1/index.pug',
    filename: 'node.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/referral/index.pug',
    filename: 'referral.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/privacy/index.pug',
    filename: 'privacy.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/return/index.pug',
    filename: 'return.html',
    env: process.env
  }),
  // new HtmlWebpackPlugin({
  //   template: 'src/template/internalSubscriberBoard/index.pug',
  //   filename: 'internal-subscriber-board.html'
  // }),
  new HtmlWebpackPlugin({
    template: 'src/template/specs/index.pug',
    filename: 'specs.html',
    env: process.env
  }),
  // new HtmlWebpackPlugin({
  //   template: 'src/template/sidechain/index.pug',
  //   filename: 'sidechain.html',
  //   env: process.env
  // }),
  new HtmlWebpackPlugin({
    template: 'src/template/sidechain/index.pug',
    filename: 'tech.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/wallet/index.pug',
    filename: 'send-bitcoin-anonymously-01.html',
    env: process.env
  }),
  // new HtmlWebpackPlugin({
  //   template: 'src/template/subscribe_email/index.pug',
  //   filename: 'subscribe.html',
  //   env: process.env
  // }),
  new HtmlWebpackPlugin({
    template: 'src/template/about/index.pug',
    filename: 'about.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/becomeValidator/index.pug',
    filename: 'validator.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/launchOnAWS/index.pug',
    filename: 'doc-setup-amazon-instance.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/launchOnGoogleCloud/index.pug',
    filename: 'doc-setup-gcloud-instance.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/launchOnDigitalOcean/index.pug',
    filename: 'doc-setup-digitalocean-instance.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/home1/index.pug',
    filename: 'index.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/homeTet/index.pug',
    filename: 'tet.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/airdrop/index.pug',
    filename: 'airdrop.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/self_funded/index.pug',
    filename: 'self-funded.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/free_software/index.pug',
    filename: 'free-software.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/payment/index.pug',
    filename: 'payment.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/order_confirmation/index.pug',
    filename: 'thankyou.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/dex/index.pug',
    filename: 'dex.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/build/apps/index.pug',
    filename: 'create/apps.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/build/tokens/index.pug',
    filename: 'create/privacy-coins.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/order_history/index.pug',
    filename: 'order/history.html',
    env: process.env
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/payroll/index.pug',
    filename: 'payroll.html',
    env: process.env
  })
  // new HtmlWebpackPlugin({
  //   template: 'src/template/mine/index.pug',
  //   filename: 'mine.html'
  // }),
];

const copyPlugin = new CopyPlugin([
  {
    from: path.resolve(__dirname, './src/js/lib'),
    to: 'lib'
  },
  {
    from: path.resolve(__dirname, './src/docs'),
    to: ''
  },
  {
    from: path.resolve(__dirname, './src/image/seo'),
    to: ''
  },
  {
    from: path.resolve(__dirname, './robots.txt'),
    to: ''
  }
]);

const customPlugin = [
  new webpack.ProvidePlugin({
    noUiSlider: 'nouislider'
  })
];

const production = process.env.NODE_ENV === 'production';
console.debug(`Production mode: ${!!production}`);

const devConfig = {
  mode: 'development',
  devServer: {
    host: '0.0.0.0',
    contentBase: './dist',
    disableHostCheck: true
  },
  plugins: [
    ...templateGen,
    new webpack.DefinePlugin({
      APP_ENV: JSON.stringify({
        ...process.env,
        production
      })
    }),
    ...customPlugin,
    copyPlugin
  ],
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          'style-loader',
          'css-loader', // translates CSS into CommonJS
          { loader: 'postcss-loader' },
          'sass-loader' // compiles Sass to CSS, using Node Sass by default
        ]
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        options: {
          self: true,
          root: path.resolve(__dirname, 'src/template')
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp|glb|mp3|woff)$/,
        use: [
          {
            loader: 'file-loader',
            options: {}
          }
        ]
      }
    ]
  }
};

const prodConfig = {
  mode: 'production',
  plugins: [
    // new CleanWebpackPlugin(['dist/*']) for < v2 versions of CleanWebpackPlugin
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].[hash:8].css',
      chunkFilename: '[id].[hash:8].css'
    }),
    new webpack.DefinePlugin({
      APP_ENV: JSON.stringify({
        ...process.env,
        production
      })
    }),
    ...customPlugin,
    copyPlugin,
    ...templateGen
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader', // translates CSS into CommonJS
          { loader: 'postcss-loader' },
          'sass-loader' // compiles Sass to CSS, using Node Sass by default
        ]
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        options: {
          self: true,
          root: path.resolve(__dirname, 'src/template')
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp|glb|mp3|woff)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/[hash:7].[ext]'
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
  }
};

module.exports = {
  entry: path.resolve(__dirname, './src/js/index.js'),
  devtool: 'inline-source-map',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@image': path.resolve(__dirname, 'src/image')
    }
  },
  ...(production ? prodConfig : devConfig)
};

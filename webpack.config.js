const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin')

const templateGen = [
  new HtmlWebpackPlugin({
    template: 'src/template/home/index.pug',
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/referral/index.pug',
    filename: 'referral.html'
  }),
  new HtmlWebpackPlugin({
    template: 'src/template/about/index.pug',
    filename: 'about.html'
  }),
  // new HtmlWebpackPlugin({
  //   template: 'src/template/mine/index.pug',
  //   filename: 'mine.html'
  // }),
];

const production = process.env.NODE_ENV === 'production';
const env = production ? require('./.env.production') : require('./.env.development');

const devConfig = {
  mode: 'development',
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    ...templateGen,
    new webpack.DefinePlugin({
      APP_ENV: JSON.stringify({
        ...env,
        production
      }),
    }),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, './src/js/lib'),
        to: 'lib'
      }
    ]),
  ],
  module: {
    rules: [{
        test: /\.scss$/,
        use: [
            "style-loader",
            "css-loader", // translates CSS into CommonJS
            { loader: 'postcss-loader' },
            "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
    },
    { 
      test: /\.pug$/,
      use: ['pug-loader']
    },
    {
      test: /\.(png|jpe?g|gif|svg|webp|glb)$/,
      use: [
        {
          loader: 'file-loader',
          options: {},
        },
      ],
    },]
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
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new webpack.DefinePlugin({
      APP_ENV: JSON.stringify({
        ...env,
        production
      }),
    }),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, './src/js/lib'),
        to: 'lib'
      }
    ]),
    ...templateGen
  ],
  module: {
    rules: [{
        test: /\.scss$/,
        use: [
            MiniCssExtractPlugin.loader,
            "css-loader", // translates CSS into CommonJS
            { loader: 'postcss-loader' },
            "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
    },
    { 
      test: /\.pug$/,
      use: ['pug-loader']
    },{
      test: /\.(png|jpe?g|gif|svg|webp|glb)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: 'assets/[hash:7].[ext]',
          },
        },
      ],
    }]
  },
  optimization: {
    minimizer: [new OptimizeCSSAssetsPlugin({})],
  }
};

  module.exports = {
    entry: path.resolve(__dirname, './src/js/index.js'),
    devtool: 'inline-source-map',
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    ...production ? prodConfig : devConfig
  };
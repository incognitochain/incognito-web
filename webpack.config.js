const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const devConfig = {
  mode: 'development',
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development',
      template: path.resolve(__dirname, './src/template/index.pug')
    }),
  ],
  module: {
    rules: [{
        test: /\.scss$/,
        use: [
            "style-loader",
            "css-loader", // translates CSS into CommonJS
            "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
    },
    { 
      test: /\.pug$/,
      use: ['pug-loader']
    },
    {
      test: /\.(png|jpe?g|gif|svg|webp)$/,
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
    new HtmlWebpackPlugin({
      title: 'Development',
      template: path.resolve(__dirname, './src/template/index.pug')
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
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
      test: /\.(png|jpe?g|gif|svg|webp)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: 'images/[hash:7].[ext]',
          },
        },
      ],
    }]
  },
  optimization: {
    minimizer: [new OptimizeCSSAssetsPlugin({})],
  }
};

  module.exports = (env, argv) => {
    const isProduction = (argv.mode === 'production');

    return {
      entry: path.resolve(__dirname, './src/index.js'),
      devtool: 'inline-source-map',
      output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
      },
      ...isProduction ? prodConfig : devConfig
    };
  };
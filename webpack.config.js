const path = require("path");
const webpack = require("webpack")
const HtmlPlugin = require("html-webpack-plugin")
const exludedFolders = [path.join(__dirname, "node_modules")];

module.exports = {
  entry: ["./src/index.js"],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    watchContentBase: true,
    open: true,
    port: 3003,
    compress: true
  },
  output: {
    filename: "assets/scripts/[name].[hash].js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      // CSS
      {
        test: /\.css$/,
        exclude: exludedFolders,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    new HtmlPlugin({
      template: "./src/index.html",
      excludeChunks: ["base"],
      filename: "index.html",
      minify: {
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true
      }
    })
  ],
  resolve: {
    modules: [path.resolve("./src"), path.resolve("./node_modules")]
  }
}

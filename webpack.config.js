import WebpackManifestPlugin from "webpack-manifest-plugin";
import Dotenv from "dotenv-webpack";
import webpack from "webpack";
import entry from "./entry.js";
import path from "path";

const { cliPathInput, cliPathOutput, cliPathEnv } = entry;

const cli = {
  target: "node",
  entry: cliPathInput,
  output: {
    filename: cliPathOutput,
    path: path.resolve("./"),
  },
  experiments: {
    topLevelAwait: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [
    new Dotenv({
      path: cliPathEnv,
      systemvars: true,
    }),
  ],
};

// const web = {
//   mode: "production",
//   plugins: [
//     new WebpackManifestPlugin({
//       fileName: "manifest.json",
//     }),
//   ],
// };

export default [cli];

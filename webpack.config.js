import WebpackManifestPlugin from "webpack-manifest-plugin";
import Dotenv from "dotenv-webpack";
import webpack from "webpack";
import entry from "./entry.js";
import path from "path";

const { cliPathInput, cliPathOutput, cliPathEnv } = entry;

const cli = {
  mode: "production",
  target: "node",
  entry: cliPathInput,
  output: {
    filename: cliPathOutput,
    path: path.resolve("./"),
  },
  resolve: {
    extensions: [".mjs", ".js", ".json"],
  },
  experiments: {
    topLevelAwait: true,
  },

  ignoreWarnings: [{ module: /node_modules\/ws\/lib/ }],

  module: {
    rules: [
      {
        test: /\.(js|mjs)$/,
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
    new webpack.ContextReplacementPlugin(/express\/lib/, path.resolve("./"), {}),
  ],
};

export default [cli];

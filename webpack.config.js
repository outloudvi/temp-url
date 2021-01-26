const { readFileSync } = require('fs')
const path = require('path')
const webpack = require('webpack')

const mode = process.env.NODE_ENV || 'production'

module.exports = {
  target: 'webworker',
  mode,
  entry: path.resolve(__dirname, 'src/index.ts'),
  output: {
    filename: `worker.${mode}.js`,
    path: path.join(__dirname, 'dist'),
  },
  mode,
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      STATIC: JSON.stringify({
        'index.html': readFileSync(
          path.resolve(__dirname, 'src/index.html'),
          'utf-8',
        ),
      }),
    }),
  ],
}

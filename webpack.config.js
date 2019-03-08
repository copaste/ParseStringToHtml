const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const htmlWebpackPlugin = new HtmlWebpackPlugin({
    template: path.join(__dirname, "demo/src/index.html"),
    filename: "./index.html"
});

module.exports = {
	// entry: './src/index.ts',
	entry: path.join(__dirname, "demo/src/index.js"),
	output: {
        path: path.join(__dirname, "demo/dist"),
        filename: "bundle.js"
    },
	devtool: 'inline-source-map',
  	module: {
		rules: [
			{
			  test: /\.tsx?$/,
			  use: 'ts-loader',
			  exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: [ '.tsx', '.ts', '.js' ]
	},
	plugins: [htmlWebpackPlugin],
  	output: {
    	filename: 'index.js',
    	path: path.resolve(__dirname, 'dist')
  	},
    devServer: {
        port: 3001
    }
};

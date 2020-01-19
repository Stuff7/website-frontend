const path = require("path")

const Libs = "C:/Users/Armando/Downloads/Projects/javascript/Libs"
module.exports = {
	entry: "./src/uptime.js",
	output: {
		filename: "uptime.js",
		path: path.resolve(__dirname, "dist")
	},
	mode: "production",
	resolve: {
		modules: [path.resolve(Libs, "node_modules")],
		alias: {
		  Libs: Libs,
		  Base: "C:/Users/Armando/Downloads/Projects/javascript/Website/Base/src"
		}
	},
	module: {
		rules: [
		{
			test: /\js$/,
			exclude: /(node_modules)/,
			use: {
				loader: path.resolve(Libs, "node_modules/babel-loader"),
				options: {
					presets: [[path.resolve(Libs, "node_modules/@babel/preset-env"), {
						"targets": "> 0.25%, not dead",
						"useBuiltIns": "usage",
						"corejs": "3"
					}]],
					plugins: [
						path.resolve(Libs, "node_modules/@babel/plugin-transform-runtime")
					]
				}
			}
		}
	]
	},
}
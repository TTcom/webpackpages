const path = require('path');
var glob = require('glob');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const cleanWebpackPlugin = require("clean-webpack-plugin");  //清除dist
const ExtractTextPlugin = require("extract-text-webpack-plugin");   //抽离css
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin') //压缩css
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');   //压缩js

function getEntries(globPath) {
     var files = glob.sync(globPath),
       entries = {};

     files.forEach(function(filepath) {
         // 取倒数第二层(view下面的文件夹)做包名
         var split = filepath.split('/');
         var name = split[split.length - 2];

         entries[name] = './' + filepath;
     });
             console.log(entries)
     return entries;
}

var entries = getEntries('src/pages/**/index.js');

var webpackConfig = {
//entry: {
//	  index: './src/pages/index/index.js', 
//	  about: './src/pages/about/about.js'
//
//},
entry: entries,

devtool: 'inline-source-map', //找错

output: {
    path: path.join(__dirname, 'dist'), // 输出目录的配置，模板、样式、脚本、图片等资源的路径配置都相对于它
//    publicPath: '/',       // 模板、样式、脚本、图片等资源对应的server上的路径
    filename: 'js/[name].js'     // 每个页面对应的主js的生成配置
  
},
    //提取公共部分
	 optimization: {
	 	splitChunks: {
	 		cacheGroups: {
	 			vendor: {
	 				// test: /\.js$/,
	 				test: path.resolve(__dirname, './src/common/css'),
	 				chunks: "all", //表示显示块的范围，有三个可选值：initial(初始块)、async(按需加载块)、all(全部块)，默认为all;
	 				name: "vendor", //拆分出来块的名字(Chunk Names)，默认由块名和hash值自动生成；
	 				minChunks: 2,
	 				reuseExistingChunk: true,
	 				enforce: true
	 			}
	 		}
	 	}
	 },
   

 module: {
      rules: [
        {
          test: /\.css$/,
			    use: ExtractTextPlugin.extract({
			          fallback: "style-loader",
			          use: "css-loader"
			     })
        },
//      {
//      test: /\.(png|jpg|gif)$/,
//      use: [
//        {
//          loader: 'file-loader',
//          options: {}
//        }
//      ]
//    },
          {
                test:/\.(gif|png|jpg|woff|svg|ttf|eot)$/,//图片的处理
                use:[{
                    loader:'url-loader',
                    options: {
                            limit: 8192,    // 小于8k的图片自动转成base64格式，并且不会存在实体图片
                            outputPath: 'images/'   // 图片打包后存放的目录
                        }
                    
             }]
                    
         },

        {
				  test: /\.(html)$/,
				  use: {
				    loader: 'html-loader',
				    options: {
				      attrs: [':data-src',':src']
				    }
				  }
				}
//      {
//        test: /\.(png|svg|jpg|gif)$/,
//        use: [
//          'file-loader'
//        ]
//      },
//      {
//        test: /\.(woff|woff2|eot|ttf|otf)$/,
//        use: [
//          'file-loader'
//        ]
//      }
      ]
   },

 plugins: [ 
 
		new cleanWebpackPlugin(['dist']),
		//压缩css
		new webpack.HotModuleReplacementPlugin(),
		
		new OptimizeCSSPlugin({
			cssProcessorOptions: {
				safe: true
			}
		}),		
		//压缩js
		new UglifyJSPlugin({
			uglifyOptions: {
				compress: {
					warnings: false,
					drop_debugger: false,
					drop_console: false
				}
			}
		}),
     new ExtractTextPlugin('css/[name].css'),
 ],
 	devServer: {
		contentBase: path.join(__dirname, "src"),
//		publicPath:'/',
		host: "localhost",
		port: "8080",
	//	overlay: true, // 浏览器页面上显示错误
		// open: true, // 开启浏览器
		// stats: "errors-only", //stats: "errors-only"表示只打印错误：
		hot: true // 开启热更新
	},

};

Object.keys(entries).forEach(function(name) {
    // 每个页面生成一个entry，如果需要HotUpdate，在这里修改entry
    webpackConfig.entry[name] = entries[name];

    // 每个页面生成一个html
    var plugin = new HtmlWebpackPlugin({
    	  favicon: './src/common/img/favicon.ico', // favicon路径，通过webpack引入同时可以生成hash值
        // 生成出来的html文件名
        filename: './'+name + '.html',
        // 每个html的模版，这里多个页面使用同一个模版
        template: './src/pages/' + name + '/'+ name +'.html', // html模板路径
        // 自动将引用插入html
        inject: true,
        // 每个html引用的js模块，也可以在这里加上vendor等公用模块
       chunks: ['vendor', name], // 需要引入的chunk，不配置就会引入所有页面的资源
    });
    console.log(plugin)
    webpackConfig.plugins.push(plugin);
})

module.exports = webpackConfig


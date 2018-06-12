const path = require('path');
const webpack = require('webpack'); //to access built-in plugins
const html = require('html-webpack-plugin');
const cleanup = require('clean-webpack-plugin');
const cpy = require('copy-webpack-plugin')
const package = require('./package.json')

const config = {
    entry: {},
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash].js'
    },
    module: {

        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader' // creates style nodes from JS strings
                    },
                    {
                        loader: 'css-loader' // translates CSS into CommonJS
                    }
                ],
                
            },
            {
                test: /\.less$/,
                use: [{
                  loader: 'style-loader' // creates style nodes from JS strings
                }, {
                  loader: 'css-loader' // translates CSS into CommonJS
                }, {
                  loader: 'less-loader', options: { javascriptEnabled: true } 
                }]
              },
            {
                test: /\.jsx?$/,
                include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, './node_modules/react-svg-joystick/src')],
                // exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015', 'stage-0'],
                }
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            }, {
                test: /\.svg/,
                use: {
                    loader: 'svg-url-loader'
                }
            }
        ]

    },
    plugins: [
        /*
        new cleanup(['dist'], {
            //        root:     __dirname,
            exclude: [
                //'shared.js'
            ],
            verbose: true,
            dry: false
        }),
        */
        new cpy([{
            from: './assets',
            to: './assets',
            toType: 'dir'
        }]),
        
    ]

}

Object.keys(package.entry).forEach((k) => {
    config.entry[k] = package.entry[k]
    config.plugins.push(new html({
        inject: true,
        title: k,
        template: 'src/index.ejs',
        filename: `${k}.html`,
        chunks: [k]
    }))
})


config.devServer = {
    host: "0.0.0.0", //本机的局域网ip
    open: true //是否运行成功后直接打开页面
}

module.exports = config
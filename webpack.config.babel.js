const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: {
        contents: path.join(__dirname, 'src/scripts/contents.js'),
        background: path.join(__dirname, 'src/scripts/background.js'),
        popup: path.join(__dirname, 'src/scripts/popup.js'),
        results: path.join(__dirname, 'src/scripts/results.js'),
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'scripts/[name].js',
    },
    target: 'web',
    module: {
        rules:[
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['env', {'modules': false}]
                        ]
                    }
                }
            },
            {
                exclude: /node_modules/
            },
        ]
    },
    plugins: [
        new UglifyJSPlugin(),
        new CopyWebpackPlugin(
            [
                {
                    from: 'src/manifest.json'
                },
                {
                    from: 'src/scripts/lib/hot-reload.js',
                    to: 'scripts/lib/hot-reload.js'
                },
                {
                    from: 'src/html',
                    to: 'html'
                },
                {
                    from: 'src/icons',
                    to: 'icons'
                }
            ]
        ),
        new webpack.ProvidePlugin({
            tracking: 'tracking',
        }),
    ]
};

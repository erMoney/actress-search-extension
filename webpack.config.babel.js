const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: {
        contentScripts: path.join(__dirname, 'src', 'scripts', 'contentScripts.js'),
        backgroundScripts: path.join(__dirname, 'src', 'scripts', 'backgroundScripts.js'),
        popupScripts: path.join(__dirname, 'src', 'scripts', 'popupScripts.js'),
        resultsScripts: path.join(__dirname, 'src', 'scripts', 'resultsScripts.js'),
    },
    output: {
        path: path.join(__dirname, "dist"),
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
                    from: path.join(__dirname, 'src', 'manifest.json'),
                    to: path.join(__dirname, 'dist'),
                },
                {
                    from: path.join(__dirname, 'src', 'scripts', 'lib', 'hot-reload.js'),
                    to: path.join(__dirname, 'dist', 'scripts', 'lib'),
                },
                {
                    from: path.join(__dirname, 'src', 'html', 'popup.html'),
                    to: path.join(__dirname, 'dist', 'html'),
                },
                {
                    from: path.join(__dirname, 'src', 'html', 'results.html'),
                    to: path.join(__dirname, 'dist', 'html'),
                },
                {
                    from: path.join(__dirname, 'src', 'html', 'assets', 'css', 'main.css'),
                    to: path.join(__dirname, 'dist', 'html', 'assets', 'css'),
                },
                {
                    from: path.join(__dirname, 'src', 'icons', '16.png'),
                    to: path.join(__dirname, 'dist', 'icons', '16.png'),
                },
                {
                    from: path.join(__dirname, 'src', 'icons', '48.png'),
                    to: path.join(__dirname, 'dist', 'icons', '48.png'),
                },
                {
                    from: path.join(__dirname, 'src', 'icons', '128.png'),
                    to: path.join(__dirname, 'dist', 'icons', '128.png'),
                },
            ]
        ),
        new webpack.ProvidePlugin({
            tracking: 'tracking',
        }),
    ]
};

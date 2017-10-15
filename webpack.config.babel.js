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
        new CopyWebpackPlugin(
            [
                {
                    from: path.join(__dirname, 'src', 'manifest.json'),
                    to: path.join(__dirname, 'dist'),
                },
                {
                    from: path.join(__dirname, 'src', 'html', 'popup.html'),
                    to: path.join(__dirname, 'dist', 'html'),
                },
                {
                    from: path.join(__dirname, 'src', 'html', 'results.html'),
                    to: path.join(__dirname, 'dist', 'html'),
                }
            ]
        ),
         new UglifyJSPlugin()
    ]
};
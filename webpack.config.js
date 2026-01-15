const path = require('path');

module.exports = {
    devtool: 'eval-source-map',
    entry: '/frontend/index.ts',
    output: {
        publicPath: '/static',
        filename: 'packed_index.js',
        path: path.join(__dirname, '/backend/static')
    },
    resolve: {extensions: ['.ts']},
    module: {
        rules: [
            {
                test: /.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader:'babel-loader'
                    },
                    {
                        loader: 'ts-loader'
                    }
                ]
            },
            {
                test: /.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    }
}
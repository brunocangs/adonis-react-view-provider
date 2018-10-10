const path = require('path');
// const plugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = (Helpers) => {
    const isDev = process.env.NODE_ENV === 'development';
    let config = {
        entry: {
            render: ['@babel/polyfill', path.resolve(__dirname, './renderResolver.js')]
        },
        output: {
            filename: '[name].js',
            path: Helpers.publicPath()
        },
        module: {
            rules: [
                {
                    oneOf: [
                        {
                            test: /\.(js|jsx|mjs)$/,
                            include: Helpers.viewsPath(),
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-react', '@babel/preset-env']
                            }
                        },
                        {
                            exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                publicPath: '/'
                            },
                        },
                    ],
                }
            ]
        },
        devtool: isDev ? 'eval-source-map' : 'cheap-source-map',
        mode: process.env.NODE_ENV || 'development',
        optimization: {
            minimize: true,
            nodeEnv: process.env.NODE_ENV,
            splitChunks: {
                chunks: 'all',
                minChunks: 1,
                name: (chunk) => ('vendor')
            }
        },
        // plugins: [new plugin()]
    };
    return config;
};

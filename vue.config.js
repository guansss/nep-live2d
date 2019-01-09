const path = require('path');

module.exports = {
    productionSourceMap: false,
    configureWebpack: {
        resolve: {
            alias: {
                PIXI: 'pixi.js'
            }
        }
    },
    devServer: {
        contentBase: path.resolve('wallpaper'),
        historyApiFallback: false
    }
};

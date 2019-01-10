const path = require('path');

module.exports = {
    productionSourceMap: false,
    configureWebpack: {
        resolve: {
            alias: {
                'pixi-live2d': path.resolve('pixi-live2d'),
                PIXI: 'pixi.js'
            }
        }
    },
    devServer: {
        contentBase: path.resolve('wallpaper'),
        historyApiFallback: false
    }
};

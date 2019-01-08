const path = require('path');

module.exports = {
    productionSourceMap: false,
    configureWebpack: {
        externals: {
            'live2d.min.js': '',
            'raw-loader!live2d/neptune/normal.model.json': ''
        }
    },
    devServer: {
        contentBase: path.resolve('wallpaper'),
        historyApiFallback: false
    }
};

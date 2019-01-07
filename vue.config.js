const path = require('path');

module.exports = {
    productionSourceMap: false,
    devServer: {
        contentBase: path.resolve('wallpaper'),
        historyApiFallback: false
    }
};

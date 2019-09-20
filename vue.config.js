const path = require('path');

module.exports = {
    productionSourceMap: false,
    devServer: {
        contentBase: path.resolve('wallpaper'),
        historyApiFallback: false,
    },
    chainWebpack(config) {
        const svgRule = config.module.rule('svg');

        svgRule.uses.clear();
        svgRule.use('vue-svg-loader').loader('vue-svg-loader');
    },
};

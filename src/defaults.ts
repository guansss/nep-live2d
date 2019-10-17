export default {
    LIVE2D_DIRECTORY: 'live2d',
    LIVE2D_MODELS: (process.env.VUE_APP_LIVE2D_MODELS || '').split(',').map(model => model.trim()),

    SNOW_ENABLED: true,
    SNOW_NUMBER: 1000,
};

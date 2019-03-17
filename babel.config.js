module.exports = api => {
    const inTest = api.env('test');

    return {
        presets: inTest
            ? [
                  [
                      '@babel/preset-env',
                      {
                          targets: {
                              node: 'current',
                          },
                      },
                  ],
                  '@babel/preset-typescript',
              ]
            : ['@vue/app'],

        plugins: ['@babel/plugin-proposal-class-properties'],
    };
};

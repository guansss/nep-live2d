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
              ]
            : ['@vue/app'],
    };
};

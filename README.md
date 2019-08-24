# nep-live2d

[Current Progress](https://github.com/guansss/nep-live2d/projects/1)

This is the new version of *Neptune Live2D* wallpaper and still in early development state.

The project is based on Live2D WebGL SDK 2.1, and thus models of newer or older version are not supported.

## Setup

### Dependencies

It's recommended to use [Yarn](https://yarnpkg.com) as package manager, *npm* is fine though.

``` sh
yarn install
```

### Source files

Due to copyright restrictions, the sources of Live2D SDK and Live2D models are not provided, you need to supply them by yourself.

1. Download [Live2D WebGL SDK 2.1](http://sites.cybernoids.jp/cubism-sdk2/webgl2-1) and take `live2d.min.js` within.

2. Take `live2d` folder from the source of this wallpaper. (In Wallpaper Engine, right click on the preview of this wallpaper and select *Open in Explorer*.)

3. Create `wallpaper` directory at project root, then place files of step 1 and 2 into it.

The final file structure should be like:

``` sh
.
└── wallpaper
    ├── live2d
    └── live2d.min.js
```

### Environment

Create `.env.local` file at project root, add `VUE_APP_LIVE2D_PATH` and `VUE_APP_LIVE2D_MODELS` variables into it.

Considering this env file is just a temporary design, you can simply use the following template:

```
VUE_APP_LIVE2D_PATH=/live2d
VUE_APP_LIVE2D_MODELS=neptune/normal.model.json
```

For more information about the format of this file, see [dotenv](https://github.com/motdotla/dotenv).

## Serving

### Sering for browsers

``` sh
yarn serve
```

### Serving for Wallpaper Engine

By redirecting the running wallpaper to the dev server, we are able to use Webpack's Hot Module Replacement (HMR) which is extremely useful for development.

To achieve that, there is a script made to generate a "bridge" HTML file which only contains the redirection. Just a few steps to use it:

1. Add `WALLPAPER_PATH` variable into the `.env.local` file introduced above. It describes the destination of output files.

``` sh
# This example represents that the output files will go to Wallpaper Engine's user project directory.
# But it's not necessary, you can use whatever position you like.

WALLPAPER_PATH=C:\Program Files (x86)\Steam\steamapps\common\wallpaper_engine\projects\myprojects\nep-live2d
```

2. Run following commands. While running `yarn setup` you may be asked for confirmations to overwrite existing files.

``` sh
yarn setup
yarn serve
```

3. Click *Open from File* at bottom left of Wallpaper Engine, navigate to the path you set for `WALLPAPER_PATH`, select the `package.json`.

And voila! HMR is now available on wallpaper!

## Building

Not implemented yet...

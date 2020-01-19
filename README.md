# nep-live2d
![GitHub package.json version](https://img.shields.io/github/package-json/v/guansss/nep-live2d?style=flat-square)
[![Codacy Badge](https://img.shields.io/codacy/grade/2a104c4ef281488bafe5404adb27ee28?style=flat-square&logo=codacy)](https://www.codacy.com/manual/guansss/nep-live2d?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=guansss/nep-live2d&amp;utm_campaign=Badge_Grade)
[![Steam Subscriptions](https://img.shields.io/steam/subscriptions/1078208425?style=flat-square&logo=steam&color=blue)](https://steamcommunity.com/sharedfiles/filedetails/?id=1078208425)
![Made with](https://img.shields.io/badge/made%20with-%E2%99%A5-ff69b4?style=flat-square)

Beta versions can be found in the [Beta Test Channel](https://steamcommunity.com/workshop/filedetails/discussion/1078208425/1484358860953044356/)

The project is based on Live2D WebGL SDK 2.1, and thus models of newer or older version are not supported.

## Setup

#### Dependencies

It's recommended to use *Yarn* as package manager, *npm* is fine though.

``` sh
yarn install
```

#### Source files

Due to copyright restrictions, the files of backgrounds, Live2D SDK and Live2D models are not provided, you need to supply them by yourself.

1. (Optional) Download [Live2D WebGL SDK 2.1](http://sites.cybernoids.jp/cubism-sdk2/webgl2-1) and take `live2d.min.js` within.

2. Create `wallpaper` directory at project root.

3. Copy following files from the distribution of this wallpaper and paste into `wallpaper`. (In Wallpaper Engine, right click on the preview of this wallpaper and select *Open in Explorer*.)

``` sh
.
└── /wallpaper
    ├── /img
    │    ├── bg_forest.jpg
    │    ├── bg_halloween.jpg
    │    └── bg_lowee.jpg
    ├── /live2d (take entire folder)
    └── live2d.min.js
```

## Serving

### Sering for browsers

``` sh
yarn serve
```

### Serving for Wallpaper Engine

By redirecting the running wallpaper to the server, we are able to use the `liveReload` and Hot Module Replacement (HMR) features of Webpack dev server, which are extremely useful for development.

To achieve that, a script was made to generate a bridge HTML file, there are a few steps to prepare before using this script:

1. Create a folder in `myproject` directory of Wallpaper Engine, for example:
    ```
    C:\Program Files (x86)\Steam\steamapps\common\wallpaper_engine\projects\myprojects\live2d
    ```

2. Go back to this project, create `.env.local` file at project root, add `WALLPAPER_PATH` variable which describes the destination of output files.

    ``` sh
    WALLPAPER_PATH=C:\Program Files (x86)\Steam\steamapps\common\wallpaper_engine\projects\myprojects\live2d
    ```

    For more information about the format of this file, see [dotenv](https://github.com/motdotla/dotenv).

3. Run following command. You may be asked for confirmations to overwrite existing files.

    ``` sh
    yarn setup
    ```

4. Check the Wallpaper Engine browser, a new wallpaper should appear with `[DEV]` prefix.

This preparation should be done only once, but any time you think the generated files are supposed be updated, you need to run `yarn setup` again.

Now, just like serving for browsers, run `yarn serve`, and then select the wallpaper, everything will work as it should be in browsers.

## Building

``` sh
yarn build
```

If you are updating an existing Workshop project instead of creating a new one, you need to specify a `WORKSHOP_ID` in `.env.local` before building the project.

``` sh
WORKSHOP_ID=123456
```

When publishing to Workshop, don't forget to copy files in `/wallpaper` and paste them into your project.

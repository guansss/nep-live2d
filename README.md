# nep-live2d

[Current Progress](https://github.com/guansss/nep-live2d/projects/1)

This is the new version of *Neptune Live2D* wallpaper and still in early development state.

The project is based on Live2D WebGL SDK 2.1, and thus models of newer or older version are not supported.

## Setup

#### Dependencies

It's recommended to use [Yarn](https://yarnpkg.com) as package manager, *npm* is fine though.

``` sh
yarn install
```

#### Source files

Due to copyright restrictions, the files of backgrounds, Live2D SDK and Live2D models are not provided, you need to supply them by yourself.

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

#### Migration

The URL format in Live2D model settings file has been changed to the "standard" format supported by browsers, URLs are now parsed by [url.resolve()](https://nodejs.org/dist/latest-v12.x/docs/api/url.html#url_url_resolve_from_to).

As a result, the prefixes of certain file paths in model settings file need to be changed from `./` to `../`, for example:

``` json5
// neptune/normal.model.json
{
    // ...

    "pose": "../general/pose.json",     // changed from "./general/pose.json"

    // ...
}
```

## Serving

### Sering for browsers

Currently there is no configuration interfaces for Wallpaper Engine, so it's fine to open via browsers.

``` sh
yarn serve
```

### Serving for Wallpaper Engine

By redirecting the running wallpaper to the dev server, we are able to use Webpack's Hot Module Replacement (HMR) which is extremely useful for development.

To achieve that, a script was made to generate a bridge HTML file, there are a few steps to prepare before using this script:

1. Create a whatever wallpaper by Wallpaper Editor, then go to its location (use *Open in Explorer*), copy the path from address bar.

2. **Exit Wallpaper Editor and close Wallpaper Engine**, delete everything in the wallpaper folder in step 1.

3. Go back to this project, create `.env.local` file at project root, add `WALLPAPER_PATH` variable into this file. It describes the destination of output files.

    ``` sh
    # For example, the created wallpaper was named "live2d"
    WALLPAPER_PATH=C:\Program Files (x86)\Steam\steamapps\common\wallpaper_engine\projects\myprojects\live2d
    ```

    For more information about the format of this file, see [dotenv](https://github.com/motdotla/dotenv).

4. Run following command. You may be asked for confirmations to overwrite existing files.

    ``` sh
    yarn setup
    ```

5. Open Wallpaper Engine, you should see the wallpaper has been renamed to *[DEV] Neptune Live2D*.

The preparation should be done only once, but any time you think the generated files are supposed be updated, you need to run `yarn setup` again.

Now, just like serving for browsers, run `yarn serve`, and select the wallpaper, then HMR is available for it!

## Building

Not yet...

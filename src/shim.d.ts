/**
 * Vue shims
 */
declare module '*.vue' {
    import Vue from 'vue';
    import 'vue-i18n';
    export default Vue;
}

/**
 * PIXI shims
 * @see https://github.com/pixijs/pixi.js/issues/5397
 */
declare module '@pixi/constants' {
    export { BLEND_MODES, DRAW_MODES } from 'pixi.js';
}

declare module '@pixi/core' {
    export { Buffer, Geometry, Renderer, Shader, State, Texture } from 'pixi.js';
}

declare module '@pixi/loaders' {
    export { Loader } from 'pixi.js';
}

declare module '@pixi/utils' {
    import { utils } from 'pixi.js';
    export import EventEmitter = utils.EventEmitter;
    export import sayHello = utils.sayHello;
}

declare module '@pixi/app' {
    export { Application } from 'pixi.js';
}

declare module '@pixi/display' {
    export { DisplayObject, Container } from 'pixi.js';
}

declare module '@pixi/particles' {
    export { ParticleContainer, ParticleRenderer } from 'pixi.js';
}

declare module '@pixi/spritesheet' {
    export { SpritesheetLoader } from 'pixi.js';
}

declare module '@pixi/sprite' {
    export { Sprite } from 'pixi.js';
}

declare module '@pixi/mesh' {
    export { Mesh } from 'pixi.js';
}

declare module '@pixi/math' {
    export { Matrix, Point } from 'pixi.js';
}

/**
 * Webpack import shims
 * @see https://stackoverflow.com/questions/43638454/webpack-typescript-image-import?rq=1
 */
declare module '*.png' {
    const value: string;
    export default value;
}

declare module '*.svg' {
    import Vue from 'vue';
    export default Vue;
}

declare module '*.vert' {
    const value: string;
    export default value;
}

declare module '*.frag' {
    const value: string;
    export default value;
}

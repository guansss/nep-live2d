/**
 * Vue shims
 * @see https://github.com/microsoft/TypeScript-Vue-Starter
 */
declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}

/**
 * PIXI shims
 * @see https://github.com/pixijs/pixi.js/issues/5397
 */
declare module '@pixi/app' {
    export { Application } from 'pixi.js';
}

declare module '@pixi/display' {
    export { DisplayObject } from 'pixi.js';
}

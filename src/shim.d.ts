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

/**
 * glml shims
 */
type WASMAddress = number;

declare module 'glmw' {
    export class mat4 {
        static create(): WASMAddress;

        static view(address: WASMAddress): Float32Array;
    }
}

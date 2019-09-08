/**
 * Vue shims
 * @see https://github.com/microsoft/TypeScript-Vue-Starter
 */
declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}

declare module '*.vue' {
    interface Vue {
        $emit(event: string, ...args: any[]): this;

        $event: any;
    }
}

/**
 * PIXI shims
 * @see https://github.com/pixijs/pixi.js/issues/5397
 */
declare module '@pixi/core' {
    export { Renderer } from 'pixi.js';
}

declare module '@pixi/utils' {
    import { utils } from 'pixi.js';
    export import EventEmitter = utils.EventEmitter;
}

declare module '@pixi/app' {
    export { Application } from 'pixi.js';
}

declare module '@pixi/display' {
    export { DisplayObject, Container } from 'pixi.js';
}

declare module '@pixi/math' {
    export { Matrix, Point } from 'pixi.js';
}

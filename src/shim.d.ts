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
 * glmw shims
 */
declare module 'glmw' {
    type WASMAddress = number;
    type mat4Address = WASMAddress;
    type vec3Address = WASMAddress;

    class Base {
        static create(): WASMAddress;

        static view(address: WASMAddress): Float32Array;
    }

    export class mat4 extends Base {
        static scale(out: mat4Address, a: mat4Address, v: vec3Address): void;

        static fromScaling(out: mat4Address, v: vec3): mat4Address;
    }

    export class vec3 extends Base {
        static fromValues(x: number, y: number, z: number): vec3Address;

        static transformMat4(out: vec3Address, a: vec3Address, m: mat4Address): void
    }
}

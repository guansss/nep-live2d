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
declare module '@pixi/core' {
    export { Renderer } from 'pixi.js';
}

declare module '@pixi/app' {
    export { Application } from 'pixi.js';
}

declare module '@pixi/display' {
    export { DisplayObject } from 'pixi.js';
}

declare module '@pixi/math' {
    export { Matrix, Point } from 'pixi.js';
}

/**
 * glmw shims
 */
declare module 'glmw' {
    type WASMAddress = number;
    type MAT4 = WASMAddress;
    type VEC3 = WASMAddress;

    export function init(): Promise<true>;

    class Base {
        static create(): WASMAddress;

        static clone(a: WASMAddress): WASMAddress;

        static identity(out: WASMAddress): WASMAddress;

        static view(address: WASMAddress): Float32Array;
    }

    export class mat4 extends Base {
        static scale(out: MAT4, a: MAT4, v: VEC3): MAT4;

        static fromTranslation(out: MAT4, v: VEC3): MAT4;

        static fromScaling(out: MAT4, v: vec3): MAT4;

        static lookAt(out: MAT4, eye: VEC3, center: VEC3, up: VEC3): MAT4;

        static ortho(
            out: MAT4,
            left: number,
            right: number,
            bottom: number,
            top: number,
            near: number,
            far: number,
        ): MAT4;

        static translate(out: MAT4, a: MAT4, v: VEC3): MAT4;

        static mul(out: MAT4, a: MAT4, b: MAT4): MAT4;
    }

    export class vec3 extends Base {
        static fromValues(x: number, y: number, z: number): VEC3;

        static transformMat4(out: VEC3, a: VEC3, m: MAT4): VEC3;
    }
}

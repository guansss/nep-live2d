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

declare module '@pixi/math' {
    export { Matrix } from 'pixi.js';
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

        static clone<T extends WASMAddress>(a: T): T;

        static identity<T extends WASMAddress>(out: T): T;

        static view(address: WASMAddress): Float32Array;
    }

    export class mat4 extends Base {
        // prettier-ignore
        static fromValues(
            m00: number, m01: number, m02: number, m03: number,
            m10: number, m11: number, m12: number, m13: number,
            m20: number, m21: number, m22: number, m23: number,
            m30: number, m31: number, m32: number, m33: number,
        ): MAT4;

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

        static scale(out: MAT4, a: MAT4, v: VEC3): MAT4;

        static mul(out: MAT4, a: MAT4, b: MAT4): MAT4;
    }

    export class vec3 extends Base {
        static fromValues(x: number, y: number, z: number): VEC3;

        static transformMat4(out: VEC3, a: VEC3, m: MAT4): VEC3;
    }
}

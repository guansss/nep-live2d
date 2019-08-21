/**
 * Declares types of the exposed variables from Live2D library.
 *
 * Since Live2D library is not open-source, these types come from inference or guess.
 * Many of them are `unknown` though.
 */

declare class Live2D {
    static setGL(gl: WebGLRenderingContext, index?: number): void;

    static getError(): unknown | undefined;
}

declare class Live2DModelWebGL {
    private constructor();

    static loadModel(buffer: ArrayBuffer): Live2DModelWebGL;

    /**
     * @returns The width of model's Live2D drawing canvas but NOT the html canvas element.
     */
    getCanvasWidth(): number;

    /**
     * @returns The height of model's Live2D drawing canvas but NOT the html canvas element.
     */
    getCanvasHeight(): number;

    setTexture(index: number, texture: WebGLTexture): void;

    setMatrix(matrix: Float32Array): void;

    setParamFloat(id: string | number, value: number, weight?: number): unknown;

    addToParamFloat(id: string | number, value: number, weight?: number): unknown;

    multParamFloat(id: string | number, value: number, weight?: number): unknown;

    setPartsOpacity(id: string | number, value: number): unknown;

    getPartsOpacity(id: string | number): number;

    getParamFloat(id: string | number): number;

    getParamIndex(id: string): number;

    getPartsDataIndex(id: string): number;

    getDrawDataIndex(id: string): number;

    getTransformedPoints(index: number): number[];

    loadParam(): void;

    saveParam(): void;

    update(): void;

    draw(): void;
}

declare class AMotion {
    setFadeIn(time: number): unknown;

    setFadeOut(time: number): unknown;

    updateParamExe(model: Live2DModelWebGL, time: DOMTimeStamp, weight: number, MotionQueueEnt: unknown): unknown;
}

declare class Live2DMotion extends AMotion {
    private constructor();

    static loadMotion(buffer: ArrayBuffer): Live2DMotion;
}

declare class MotionQueueManager {
    motions: unknown[];

    /**
     * @returns The size of internal motion arrays.
     */
    startMotion(motion: AMotion, neverUsedArg?: boolean): number;

    stopAllMotions(): void;

    isFinished(): boolean;

    updateParam(model: Live2DModelWebGL): any;
}

declare interface PhysicsHairSrc {
    SRC_TO_X: string;
    SRC_TO_Y: string;
    SRC_TO_G_ANGLE: string;
}

declare interface PhysicsHairTarget {
    TARGET_FROM_ANGLE: string;
    TARGET_FROM_ANGLE_V: string;
}

declare class PhysicsHair {
    static Src: PhysicsHairSrc;
    static Target: PhysicsHairTarget;

    setup(length: number, regist: number, mass: number): unknown;

    addSrcParam(type: string, id: string, scale: number, weight: number): unknown;

    addTargetParam(type: string, id: string, scale: number, weight: number): unknown;

    update(model: Live2DModelWebGL, time: DOMTimeStamp): unknown;
}

declare class PartsDataID {
    static getID(id: string): string;
}

/**
 * Declares types of the exposed variables from Live2D library.
 *
 * Since Live2D library is not open-source, these types come from inference or guess.
 * Many of them are `unknown` though.
 */

declare class Live2D {
    static getError(): unknown | undefined
}

declare class Live2DModelWebGL {
    static loadModel(buffer: ArrayBuffer): Live2DModelWebGL;

    getCanvasWidth(): number

    getCanvasHeight(): number

    setTexture(index: number, texture: WebGLTexture): void

    setParamFloat(id: string | number, value: number, weight?: number): unknown;

    addToParamFloat(id: string | number, value: number, weight?: number): unknown;

    multParamFloat(id: string | number, value: number, weight?: number): unknown;

    setPartsOpacity(id: string, value: number): unknown

    getDrawDataIndex(id: string): number

    getTransformedPoints(index: number): number[]

    saveParam(): void
}

declare class AMotion {
    setFadeIn(time: number): unknown;

    setFadeOut(time: number): unknown;

    updateParamExe(model: Live2DModelWebGL, time: DOMTimeStamp, weight: number, MotionQueueEnt: unknown): unknown;
}

declare class Live2DMotion {
    private constructor();

    static loadMotion(buffer: ArrayBuffer): Live2DMotion;
}

declare class MotionQueueManager {
    startMotion(motion: AMotion, unknownArg: boolean): unknown;

    stopAllMotions(): void;

    updateParam(model: Live2DModelWebGL): any;
}

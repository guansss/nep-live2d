/**
 * Declares types of the exposed variables from Live2D library.
 *
 * Live2D library is not open-source, so each of these types comes from inference or guess.
 * Still, there are many `unknown` types here.
 */

declare class Live2D {}

declare class Live2DModelWebGL {}

declare class Live2DModelJS {
    setParamFloat(id: string | number, value: number, weight: number): unknown;

    addToParamFloat(id: string | number, value: number, weight: number): unknown;

    multParamFloat(id: string | number, value: number, weight: number): unknown;
}

declare class AMotion {
    setFadeIn(time: number): unknown;

    setFadeOut(time: number): unknown;

    updateParamExe(model: Live2DModelJS, time: DOMTimeStamp, weight: number, MotionQueueEnt: unknown): unknown;
}

declare class Live2DMotion {}

declare class MotionQueueManager {
    startMotion(motion: AMotion, unknownArg: boolean): unknown;
}

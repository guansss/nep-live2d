import FocusController from '@/core/live2d/FocusController';
import Live2DModel from '@/core/live2d/Live2DModel';
import Player from '@/core/mka/Player';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import logger from '@/core/utils/log';
import MouseHandler from '@/module/live2d/MouseHandler';
import { mat4, vec3 } from 'glmw';

const log = logger('Live2DPlayer');

export default class Live2DPlayer extends Player {
    readonly sprites: Live2DSprite[] = [];

    viewMatrix = mat4.create();
    projectionMatrix = mat4.create();

    gl: WebGLRenderingContext;

    mouseHandler: MouseHandler;
    focusController: FocusController;

    constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
        super();

        this.gl = gl;
        this.mouseHandler = new MouseHandler(canvas);
        this.focusController = new FocusController();

        mat4.fromScaling(
            this.projectionMatrix,
            vec3.fromValues(1, gl.drawingBufferWidth / gl.drawingBufferHeight, 1),
        );
    }

    async addModel(modelSettingsFile: string) {
        const model = await Live2DModel.create(modelSettingsFile, this.gl);
        this.models.push(model);
    }

    removeModel(index: number) {
        if (this.models[index]) {
            this.models[index].release();
            this.models.splice(index, 1);
        }
    }

    /** @override */
    update(dt: DOMHighResTimeStamp) {
        // log('Update ' + dt);
        return true;
    }
}

import FocusController from '@/core/live2d/FocusController';
import Player from '@/core/mka/Player';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import MouseHandler from '@/module/live2d/MouseHandler';
import { mat4 } from 'glmw';

export default class Live2DPlayer extends Player {
    readonly sprites: Live2DSprite[] = [];

    viewMatrix = mat4.create();
    projectionMatrix = mat4.create();
    projectionViewMatrix = mat4.create();

    gl: WebGLRenderingContext;

    mouseHandler: MouseHandler;
    focusController: FocusController;

    constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
        super();

        this.gl = gl;
        this.mouseHandler = new MouseHandler(canvas);
        this.focusController = new FocusController();

        // height = 2
        const width = (2 * gl.drawingBufferWidth) / gl.drawingBufferHeight;
        mat4.ortho(this.projectionMatrix, width / 2, -width / 2, -1, 1, -1, 1);

        mat4.mul(this.projectionViewMatrix, this.projectionViewMatrix, this.projectionMatrix);
        mat4.mul(this.projectionViewMatrix, this.projectionViewMatrix, this.viewMatrix);
    }

    async addSprite(modelSettingsFile: string) {
        const sprite = await Live2DSprite.create(modelSettingsFile, this.gl);
        this.sprites.push(sprite);
    }

    removeSprite(index: number) {
        if (this.sprites[index]) {
            this.sprites[index].destroy();
            this.sprites.splice(index, 1);
        }
    }

    /** @override */
    update() {
        return this.sprites.some(sprite => sprite.update(this.projectionViewMatrix));
    }
}

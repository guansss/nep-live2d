import FocusController from '@/core/live2d/FocusController';
import Mka from '@/core/mka/Mka';
import Player from '@/core/mka/Player';
import { log, Tagged } from '@/core/utils/log';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import MouseHandler from '@/module/live2d/MouseHandler';
import { mat4 } from 'glmw';

export default class Live2DPlayer extends Player implements Tagged {
    tag = Live2DPlayer.name;

    readonly sprites: Live2DSprite[] = [];

    viewMatrix = mat4.create();
    projectionMatrix = mat4.create();
    projectionViewMatrix = mat4.create();

    gl: WebGLRenderingContext;

    mouseHandler: MouseHandler;
    focusController: FocusController;

    constructor(mka: Mka) {
        super();

        this.gl = mka.gl;
        Live2D.setGL(this.gl);

        this.mouseHandler = new MouseHandler(this.gl.canvas);
        this.focusController = new FocusController();

        // height = 2
        const width = (2 * this.gl.drawingBufferWidth) / this.gl.drawingBufferHeight;
        mat4.ortho(this.projectionMatrix, width / 2, -width / 2, -1, 1, -1, 1);

        mat4.mul(this.projectionViewMatrix, this.projectionViewMatrix, this.projectionMatrix);
        mat4.mul(this.projectionViewMatrix, this.projectionViewMatrix, this.viewMatrix);

        log(this, mat4.view(this.viewMatrix), mat4.view(this.projectionMatrix), mat4.view(this.projectionViewMatrix));
    }

    async addSprite(modelSettingsFile: string) {
        const sprite = await Live2DSprite.create(modelSettingsFile, this.gl);
        this.sprites.push(sprite);
        this.mka!.pixiApp.stage.addChild(sprite);
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

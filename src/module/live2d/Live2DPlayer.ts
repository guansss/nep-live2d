import FocusController from '@/core/live2d/FocusController';
import Mka from '@/core/mka/Mka';
import Player from '@/core/mka/Player';
import { log, Tagged } from '@/core/utils/log';
import { clamp } from '@/core/utils/math';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import MouseHandler from '@/module/live2d/MouseHandler';
import { EventEmitter } from '@pixi/utils';

const mouseHandingElement = document.documentElement;

export default class Live2DPlayer extends Player implements Tagged {
    tag = Live2DPlayer.name;

    readonly sprites: Live2DSprite[] = [];

    focusController: FocusController;
    mouseHandler: MouseHandler;

    constructor(mka: Mka) {
        super();

        Live2D.setGL(mka.gl);

        this.updateByGL(mka.gl);

        this.focusController = new FocusController();

        this.mouseHandler = new MouseHandler(mouseHandingElement);
        this.mouseHandler.focus = (x, y) =>
            this.focusController.focus(
                (x / mouseHandingElement.offsetWidth) * 2 - 1,
                (y / mouseHandingElement.offsetHeight) * 2 - 1,
            );
        this.mouseHandler.press = (x, y) => this.sprites.forEach(sprite => sprite.hit(x, y));
    }

    async addSprite(modelSettingsFile: string) {
        if (!this.mka) throw 'Live2DPlayer must be attached to Mka to create sprites.';

        const sprite = await Live2DSprite.create(modelSettingsFile, this.mka.gl);
        sprite.updateTransformByGL(this.mka.gl);
        this.sprites.push(sprite);
        this.mka.pixiApp.stage.addChild(sprite);
    }

    removeSprite(index: number) {
        if (this.sprites[index]) {
            this.sprites[index].destroy();
            this.sprites.splice(index, 1);
        }
    }

    /**
     * Needs to be called when WebGL context changes.
     */
    updateByGL(gl: WebGLRenderingContext) {
        this.sprites.forEach(sprite => sprite.updateTransformByGL(gl));
    }

    /** @override */
    update() {
        // TODO: calculate dt
        this.updateFocus(16);

        return true;
    }

    private updateFocus(dt: number) {
        this.focusController.update(dt);

        /*
            pixelX = (x + 1) / 2 * canvasWidth

          logicalX = (pixelX - spriteX) * 2 / spriteWidth - 1

                   = ((x + 1) * canvasWidth - spriteX * 2) / spriteWidth - 1
                      |-------------------|
                              tmpX
        */

        const tmpX = (this.focusController.x + 1) * mouseHandingElement.offsetWidth;
        const tmpY = (this.focusController.y + 1) * mouseHandingElement.offsetHeight;

        this.sprites.forEach(sprite => {
            sprite.model.focusX = clamp((tmpX - sprite.position.x * 2) / sprite.width - 1, -1, 1);
            sprite.model.focusY = -clamp((tmpY - sprite.position.y * 2) / sprite.height - 1, -1, 1);
        });
    }

    destroy() {
        this.mouseHandler.destroy();
        super.destroy();
    }
}

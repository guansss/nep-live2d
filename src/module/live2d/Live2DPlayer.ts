import FocusController from '@/core/live2d/FocusController';
import Mka from '@/core/mka/Mka';
import Player from '@/core/mka/Player';
import { clamp } from '@/core/utils/math';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import MouseHandler from '@/module/live2d/MouseHandler';
import { Container } from '@pixi/display';

const MOUSE_HANDLING_ELEMENT = document.documentElement;

export default class Live2DPlayer extends Player {
    gl: WebGLRenderingContext;

    readonly container = new Container();
    readonly sprites: Live2DSprite[] = [];

    focusController: FocusController;
    mouseHandler: MouseHandler;

    constructor(mka: Mka) {
        super();

        this.gl = mka.gl;
        this.updateByGL(this.gl);

        Live2D.setGL(this.gl);

        this.focusController = new FocusController();

        this.mouseHandler = new MouseHandler(MOUSE_HANDLING_ELEMENT);
        this.mouseHandler.focus = (x, y) =>
            this.focusController.focus(
                (x / MOUSE_HANDLING_ELEMENT.offsetWidth) * 2 - 1,
                (y / MOUSE_HANDLING_ELEMENT.offsetHeight) * 2 - 1,
            );
        this.mouseHandler.press = (x, y) => this.sprites.forEach(sprite => sprite.hit(x, y));

        mka.pixiApp.stage.addChild(this.container);
    }

    async addSprite(modelSettingsFile: string) {
        const sprite = await Live2DSprite.create(modelSettingsFile, this.gl);
        sprite.updateTransformByGL(this.gl);
        this.sprites.push(sprite);
        this.container.addChild(sprite);
    }

    removeSprite(index: number) {
        if (this.sprites[index]) {
            const sprite = this.sprites[index];
            this.container.removeChild(sprite);
            this.sprites.splice(index, 1);
            sprite.destroy();
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

        const tmpX = (this.focusController.x + 1) * MOUSE_HANDLING_ELEMENT.offsetWidth;
        const tmpY = (this.focusController.y + 1) * MOUSE_HANDLING_ELEMENT.offsetHeight;

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

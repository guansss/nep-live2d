import FocusController from '@/core/live2d/FocusController';
import Mka from '@/core/mka/Mka';
import Player from '@/core/mka/Player';
import { Tagged } from '@/core/utils/log';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import MouseHandler from '@/module/live2d/MouseHandler';

export default class Live2DPlayer extends Player implements Tagged {
    tag = Live2DPlayer.name;

    readonly sprites: Live2DSprite[] = [];

    mouseHandler: MouseHandler;
    focusController: FocusController;

    constructor(mka: Mka) {
        super();

        Live2D.setGL(mka.gl);

        this.updateByGL(mka.gl);

        this.focusController = new FocusController();
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
        return true;
    }
}

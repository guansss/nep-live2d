import FocusController from '@/core/live2d/FocusController';
import Mka from '@/core/mka/Mka';
import Player from '@/core/mka/Player';
import { Tagged } from '@/core/utils/log';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import MouseHandler from '@/module/live2d/MouseHandler';

export default class Live2DPlayer extends Player implements Tagged {
    tag = Live2DPlayer.name;

    readonly sprites: Live2DSprite[] = [];

    focusController: FocusController;
    mouseHandler: MouseHandler;

    constructor(mka: Mka) {
        super();

        Live2D.setGL(mka.gl);

        this.focusController = new FocusController();

        this.mouseHandler = new MouseHandler(document.documentElement);
        this.mouseHandler.focus = (x, y) =>
            this.focusController.focus(
                (x * 2) / document.documentElement.offsetWidth - 1,
                (-y * 2) / document.documentElement.offsetHeight + 1,
            );
    }

    async addSprite(modelSettingsFile: string) {
        if (!this.mka) throw 'Live2DPlayer must be attached to Mka before adding sprite.';

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

    /** @override */
    update() {
        // TODO: calculate dt
        this.focusController.update(16);

        const rect = this.mka!.pixiApp.view.getBoundingClientRect();

        this.sprites.forEach(sprite => {
            this.focusController.updateModel(
                sprite.model.internalModel,
                rect.left + sprite.position.x,
                rect.top + sprite.position.y,
            );
        });

        return true;
    }

    destroy() {
        this.mouseHandler.destroy();
        super.destroy();
    }
}

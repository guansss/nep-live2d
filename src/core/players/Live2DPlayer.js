import Player from '@/core/mka/Player';
import Live2DSprite from '@/core/pixi/Live2DSprite';

export default class Live2DPlayer extends Player {
    _sprites = [];

    constructor() {
        super();

        this._sprites.push(new Live2DSprite('live2d/neptune/normal.model.json'));
    }

    /**
     * @override
     */
    update(dt) {}
}

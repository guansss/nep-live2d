import Player from '@/core/mka/Player';
import Live2DSprite from '@/core/pixi/Live2DSprite';
import logger from '@/core/utils/log';

const log = logger('Live2DPlayer');

export default class Live2DPlayer extends Player {
    private readonly sprites: Live2DSprite[] = [];

    constructor() {
        super();

        this.sprites.push(new Live2DSprite('live2d/neptune/normal.model.json'));
    }

    update(dt: number) {
        // log('Update ' + dt);
        return true;
    }
}

import FocusController from '@/core/live2d/FocusController';
import Player from '@/core/mka/Player';
import Live2DSprite from '@/core/pixi/Live2DSprite';
import logger from '@/core/utils/log';
import MouseHandler from '@/module/live2d/MouseHandler';

const log = logger('Live2DPlayer');

export default class Live2DPlayer extends Player {
    readonly sprites: Live2DSprite[] = [];

    mouseHandler: MouseHandler;
    focusController: FocusController;

    constructor(canvas: HTMLCanvasElement, webGLContext: WebGLRenderingContext) {
        super();

        this.mouseHandler = new MouseHandler(canvas);
        this.focusController = new FocusController();
    }

    init() {

    }

    /** @override */
    update(dt: number) {
        // log('Update ' + dt);
        return true;
    }
}

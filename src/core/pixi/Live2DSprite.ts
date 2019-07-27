import { DisplayObject } from '@pixi/display';

export default class Live2DSprite extends DisplayObject {
    constructor(model: string) {
        super();

        console.log(`Live2DSprite initialized with "${model}"`);
    }
}

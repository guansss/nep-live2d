import { Container } from '@pixi/display';

export default class Live2DSprite extends Container {
    constructor(model) {
        super();

        console.log(`Live2DSprite initialized with "${model}"`);
    }
}

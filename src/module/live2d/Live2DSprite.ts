import Live2DModel from '@/core/live2d/Live2DModel';
import { DisplayObject } from '@pixi/display';
import { mat4, vec3 } from 'glmw';

export default class Live2DSprite extends DisplayObject {

    model: Live2DModel;

    constructor(modelSettingsFile: string) {
        super();

        console.log(`Live2DSprite initialized with "${modelSettingsFile}"`);
    }

    set x(value: number) {
        this.set(value, this.y);
    }

    get x() {
        return this.position.x;
    }

    set y(value: number) {
        this.set(this.x, value);
    }

    get y() {
        return this.position.y;
    }

    set(x: number, y: number) {
        const position = this.transform.position;

        const dx = x - position.x;
        const dy = y - position.y;

        position.x = x;
        position.y = y;

        mat4.translate(this.modelMatrix, this.modelMatrix, vec3.fromValues(dx, dy, 0));
    }

    render() {

    }
}

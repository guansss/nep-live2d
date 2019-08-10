import Live2DModel from '@/core/live2d/Live2DModel';
import { DisplayObject } from '@pixi/display';
import { MAT4 } from 'glmw';

export default class Live2DSprite extends DisplayObject {
    model: Live2DModel;

    static async create(modelSettingsFile: string, gl: WebGLRenderingContext) {
        const model = await Live2DModel.create(modelSettingsFile, gl);
        return new Live2DSprite(model);
    }

    private constructor(model: Live2DModel) {
        super();
        this.model = model;
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

        this.model.translate(dx, dy);
    }

    update(transform: MAT4) {
        this.model.update(transform);
        return true;
    }

    destroy() {
        this.model.release();
        super.destroy();
    }
}

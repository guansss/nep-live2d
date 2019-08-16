import Live2DModel from '@/core/live2d/Live2DModel';
import { log, Tagged } from '@/core/utils/log';
import { Renderer } from '@pixi/core';
import { DisplayObject } from '@pixi/display';

export default class Live2DSprite extends DisplayObject implements Tagged {
    tag = Live2DSprite.name;

    model: Live2DModel;

    // temporary 4x4 matrix
    // prettier-ignore
    modelTransform = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);

    width: number = 2;
    height: number = 2;
    centerX: number = 0;
    centerY: number = 0;

    drawingScaleX = 1;
    drawingScaleY = 1;

    static async create(modelSettingsFile: string, gl: WebGLRenderingContext) {
        const model = await Live2DModel.create(modelSettingsFile, gl);
        return new Live2DSprite(model);
    }

    private constructor(model: Live2DModel) {
        super();

        this.model = model;

        if (model.modelSettings.layout) {
            this.width = model.modelSettings.layout.width || this.width;
            this.height = model.modelSettings.layout.height || this.height;
            this.centerX = model.modelSettings.layout.centerX || this.centerX;
            this.centerY = model.modelSettings.layout.centerY || this.centerY;
        }
    }

    updateTransformByGL(gl: WebGLRenderingContext) {
        this.drawingScaleX = this.width / gl.drawingBufferWidth;
        this.drawingScaleY = -this.height / gl.drawingBufferHeight; // flip Y
    }

    /** @override */
    render(renderer: Renderer) {
        this.updateTransform();

        const wt = this.transform.worldTransform;
        const transform = this.modelTransform;

        // put sprite's 3x3 matrix into model's 4x4 matrix
        transform[0] = wt.a * this.drawingScaleX;
        transform[1] = wt.c;
        transform[4] = wt.b;
        transform[5] = wt.d * this.drawingScaleY;
        transform[12] = wt.tx * this.drawingScaleX + (this.centerX - this.width / 2);
        transform[13] = wt.ty * this.drawingScaleY - (this.centerY - this.height / 2);

        log(this, transform);

        this.model.update(transform);
    }

    destroy() {
        this.model.release();
        super.destroy();
    }
}

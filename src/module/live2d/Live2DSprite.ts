import Live2DModel from '@/core/live2d/Live2DModel';
import { log, Tagged } from '@/core/utils/log';
import { DisplayObject } from '@pixi/display';

export default class Live2DSprite extends DisplayObject implements Tagged {
    tag = Live2DSprite.name;

    model: Live2DModel;

    modelTransform = new Float32Array(16);

    static async create(modelSettingsFile: string, gl: WebGLRenderingContext) {
        const model = await Live2DModel.create(modelSettingsFile, gl);
        return new Live2DSprite(model);
    }

    private constructor(model: Live2DModel) {
        super();
        this.model = model;
    }

    update() {
        this.updateTransform();

        const spriteTransform = this.transform.worldTransform;
        const modelTransform = this.modelTransform;

        // put sprite's 3x3 matrix into model's 4x4 matrix
        modelTransform[0] = spriteTransform.a;
        modelTransform[1] = spriteTransform.c;
        modelTransform[2] = 0;
        modelTransform[3] = 0;
        modelTransform[4] = -spriteTransform.b;
        modelTransform[5] = -spriteTransform.d;
        modelTransform[6] = 0;
        modelTransform[7] = 0;
        modelTransform[8] = 0;
        modelTransform[9] = 0;
        modelTransform[10] = 1;
        modelTransform[11] = 0;
        modelTransform[12] = spriteTransform.tx;
        modelTransform[13] = -spriteTransform.ty;
        modelTransform[14] = 0;
        modelTransform[15] = 1;

        log(this, modelTransform);

        this.model.update(modelTransform);
        return true;
    }

    destroy() {
        this.model.release();
        super.destroy();
    }
}

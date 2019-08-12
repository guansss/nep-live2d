import Live2DEyeBlink from '@/core/live2d/Live2DEyeBlink';
import { loadModel, loadModelSettings, loadPhysics, loadPose, loadTexture } from '@/core/live2d/Live2DLoader';
import Live2DPhysics from '@/core/live2d/Live2DPhysics';
import Live2DPose from '@/core/live2d/Live2DPose';
import ModelSettings from '@/core/live2d/ModelSettings';
import MotionManager from '@/core/live2d/MotionManager';
import { log, Tagged } from '@/core/utils/log';
import { randomID } from '@/core/utils/string';
import { MAT4, mat4, vec3 } from 'glmw';

export default class Live2DModel implements Tagged {
    tag = Live2DModel.name + '(uninitialized)';

    private readonly internalModel: Live2DModelWebGL;
    private readonly webGLContext: WebGLRenderingContext;
    private readonly textures: WebGLTexture[] = [];

    name: string;
    modelSettings: ModelSettings;
    motionManager: MotionManager;

    modelMatrix = mat4.create();

    eyeBlink: Live2DEyeBlink;
    physics?: Live2DPhysics;
    pose?: Live2DPose;

    static async create(file: string, webGLContext: WebGLRenderingContext) {
        const modelSettings = await loadModelSettings(file);
        if (!modelSettings) throw `Failed to load model settings from "${file}"`;

        let internalModel: Live2DModelWebGL | undefined = undefined;
        const textures: WebGLTexture[] = [];

        await Promise.all(
            [
                async () => {
                    internalModel = await loadModel(modelSettings.model);
                },
                async () => {
                    const promises = modelSettings.textures.map(
                        async (file, i) => (textures[i] = await loadTexture(file, webGLContext)),
                    );

                    for (const promise of promises) {
                        await promise;
                    }
                },
            ].map(fun => fun()),
        );

        return new Live2DModel(internalModel!, webGLContext, modelSettings, textures);
    }

    private constructor(
        internalModel: Live2DModelWebGL,
        webGLContext: WebGLRenderingContext,
        modelSettings: ModelSettings,
        textures: WebGLTexture[],
    ) {
        this.internalModel = internalModel;
        this.webGLContext = webGLContext;
        this.modelSettings = modelSettings;
        this.textures = textures;

        this.name = modelSettings.name || randomID();
        this.tag = `${Live2DModel.name}(${this.name})`;

        textures.forEach((texture, i) => internalModel.setTexture(i, texture));

        this.motionManager = new MotionManager(
            this.name,
            internalModel,
            modelSettings.motions,
            modelSettings.expressions,
        );
        this.eyeBlink = new Live2DEyeBlink(internalModel);

        if (this.modelSettings.pose) {
            loadPose(this.modelSettings.pose, internalModel)
                .then(pose => (this.pose = pose))
                .catch(e => log(this, e));
        }

        if (this.modelSettings.physics) {
            loadPhysics(this.modelSettings.physics, internalModel)
                .then(physics => (this.physics = physics))
                .catch(e => log(this, e));
        }

        this.setup();
    }

    private setup() {
        if (this.modelSettings.layout) {
            const values = {
                width: 2,
                height: 2,
                centerX: 0,
                centerY: 0,
            };
            Object.assign(values, this.modelSettings.layout);

            mat4.fromTranslation(
                this.modelMatrix,
                vec3.fromValues(values.centerX - values.width / 2, values.centerY - values.height / 2, 0),
            );
        }

        if (this.modelSettings.initParams) {
            this.modelSettings.initParams.forEach(({ id, value }) => this.internalModel.setParamFloat(id, value));
        }
        if (this.modelSettings.initOpacities) {
            this.modelSettings.initOpacities.forEach(({ id, value }) => this.internalModel.setPartsOpacity(id, value));
        }

        this.internalModel.saveParam();
    }

    translate(dx: number, dy: number) {
        mat4.translate(this.modelMatrix, this.modelMatrix, vec3.fromValues(dx, dy, 0));
    }

    scale(factor: number) {
        mat4.scale(this.modelMatrix, this.modelMatrix, vec3.fromValues(factor, factor, 1));
    }

    hit(x: number, y: number) {
        log(this, `Hit (${x}, ${y})`);

        if (this.internalModel && this.modelSettings && this.modelSettings.hitAreas) {
            this.modelSettings.hitAreas.forEach(({ name, id }) => {
                let drawIndex = this.internalModel.getDrawDataIndex(id);

                if (drawIndex >= 0) {
                    const points = this.internalModel.getTransformedPoints(drawIndex);
                    let left = this.internalModel.getCanvasWidth();
                    let right = 0;
                    let top = this.internalModel.getCanvasHeight();
                    let bottom = 0;

                    for (let i = 0; i < points.length; i += 2) {
                        const px = points[i];
                        const py = points[i + 1];

                        if (px < left) left = px;
                        if (px > right) right = px;
                        if (py < top) top = py;
                        if (py > bottom) bottom = py;
                    }
                    // const tx = this.modelMatrix.invertTransformX(x);
                    // const ty = this.modelMatrix.invertTransformY(y);
                    //
                    // if (left <= tx && tx <= right && top <= ty && ty <= bottom) {
                    //     // TODO: Fire a touch event with `name`
                    // }
                }
            });
        }
    }

    update(transform: MAT4) {
        const dt = 16; // TODO: calculate dt
        if (!this.internalModel) return;

        this.internalModel.loadParam();

        const updated = this.motionManager.update();
        if (!updated) {
            this.eyeBlink.update(dt);
        }

        this.internalModel.saveParam();

        this.physics && this.physics.update(dt);
        this.pose && this.pose.update(dt);

        this.internalModel.update();

        const matrix = mat4.clone(transform);
        mat4.mul(matrix, transform, this.modelMatrix);

        const arr = new Float32Array(16);
        const src = [0.00079, 0, 0, 0, 0, -0.00095, 0, 0, 0, 0, 1, 0, -0.8, 1.3, 0, 1];
        for (let i = 0; i < 16; i++) {
            arr[i] = src[i];
        }

        this.internalModel.setMatrix(arr);
        // this.internalModel.setMatrix(mat4.view(matrix));
        this.internalModel.draw();
    }

    release() {
        if (this.webGLContext) {
            this.textures.forEach(texture => this.webGLContext.deleteTexture(texture));
        }
    }
}

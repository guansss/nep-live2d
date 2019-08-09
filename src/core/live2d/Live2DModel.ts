import Live2DEyeBlink from '@/core/live2d/Live2DEyeBlink';
import { loadModel, loadModelSettings, loadPhysics, loadPose, loadTexture } from '@/core/live2d/Live2DLoader';
import Live2DPhysics from '@/core/live2d/Live2DPhysics';
import Live2DPose from '@/core/live2d/Live2DPose';
import ModelSettings from '@/core/live2d/ModelSettings';
import MotionManager from '@/core/live2d/MotionManager';
import { log, Tagged } from '@/core/utils/log';
import { randomID } from '@/core/utils/string';
import { mat4 } from 'glmw';

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

        [
            async () => {
                internalModel = await loadModel(modelSettings.model);
            },
            async () => {
                modelSettings.textures
                    .map(async (file, i) => (textures[i] = loadTexture(file, webGLContext)))
                    .forEach(async promise => await promise);
            },
        ]
            .map(fun => fun())
            .forEach(async promise => await promise);

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
        this.modelMatrix = new L2DModelMatrix(this.internalModel.getCanvasWidth(), this.internalModel.getCanvasHeight());
        this.modelMatrix.setWidth(2);
        this.modelMatrix.setCenterPosition(0, 0);

        if (this.modelSettings.layout) {
            [
                ['width', 'setWidth'],
                ['height', 'setHeight'],
                ['x', 'setX'],
                ['y', 'setY'],
                ['center_x', 'centerX'],
                ['center_y', 'centerY'],
                ['top', 'top'],
                ['right', 'right'],
                ['bottom', 'bottom'],
                ['left', 'left'],
            ].forEach(([paramId, method]) => {
                const value = modelSettings.layout![paramId];
                if (value) {
                    (this.modelMatrix[method] as (param: number) => void)(value);
                }
            });
        }

        if (modelSettings.initParams) {
            modelSettings.initParams.forEach(({ id, value }) => this.internalModel.setParamFloat(id, value));
        }
        if (modelSettings.initOpacities) {
            modelSettings.initOpacities.forEach(({ id, value }) => this.internalModel.setPartsOpacity(id, value));
        }

        this.internalModel.saveParam();
    }

    hit(x: number, y: number) {
        this.log(`Hit (${x}, ${y})`);

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
                    const tx = this.modelMatrix.invertTransformX(x);
                    const ty = this.modelMatrix.invertTransformY(y);

                    if (left <= tx && tx <= right && top <= ty && ty <= bottom) {
                        // TODO: Fire a touch event with `name`
                    }
                }
            });
        }
    }

    update(dt: number) {
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

        MatrixStack.push();
        MatrixStack.multMatrix(this.modelMatrix.getArray());

        this.tmpMatrix = MatrixStack.getMatrix();
        this.internalModel.setMatrix(this.tmpMatrix);
        this.internalModel.draw();

        MatrixStack.pop();
    }

    release() {
        if (this.webGLContext) {
            this.textures.forEach(texture => this.webGLContext.deleteTexture(texture));
        }
    }
}

import Live2DEyeBlink from '@/core/live2d/Live2DEyeBlink';
import { loadModel, loadModelSettings, loadPhysics, loadPose, loadTexture } from '@/core/live2d/Live2DLoader';
import Live2DPhysics from '@/core/live2d/Live2DPhysics';
import Live2DPose from '@/core/live2d/Live2DPose';
import ModelSettings from '@/core/live2d/ModelSettings';
import MotionManager from '@/core/live2d/MotionManager';
import { log, Tagged } from '@/core/utils/log';
import { randomID } from '@/core/utils/string';

export default class Live2DModel implements Tagged {
    tag = Live2DModel.name + '(uninitialized)';

    readonly internalModel: Live2DModelWebGL;
    readonly webGLContext: WebGLRenderingContext;
    readonly textures: WebGLTexture[] = [];

    name: string;
    modelSettings: ModelSettings;
    motionManager: MotionManager;

    eyeBlink: Live2DEyeBlink;
    physics?: Live2DPhysics;
    pose?: Live2DPose;

    readonly width: number;
    readonly height: number;

    /** Logical size in Live2D drawing, typically equals to 2 */
    readonly logicalWidth: number;
    readonly logicalHeight: number;

    /** Offset to translate model to center position. */
    readonly offsetX: number;
    readonly offsetY: number;

    focusX = 0;
    focusY = 0;

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

        this.width = internalModel.getCanvasWidth();
        this.height = internalModel.getCanvasHeight();

        const layout = Object.assign(
            {
                width: 2,
                height: 2,
                centerX: 0,
                centerY: 0,
            },
            modelSettings.layout,
        );
        this.logicalWidth = layout.width;
        this.logicalHeight = layout.height;
        this.offsetX = layout.centerX - layout.width / 2;
        this.offsetY = layout.centerY - layout.height / 2;

        if (this.modelSettings.initParams) {
            this.modelSettings.initParams.forEach(({ id, value }) => this.internalModel.setParamFloat(id, value));
        }
        if (this.modelSettings.initOpacities) {
            this.modelSettings.initOpacities.forEach(({ id, value }) => this.internalModel.setPartsOpacity(id, value));
        }

        this.internalModel.saveParam();
    }

    /**
     * Hit test on model.
     *
     * @param x - The x position in model canvas.
     * @param y - The y position in model canvas.
     *
     * @returns The names of hit areas that have passed the test.
     */
    hitTest(x: number, y: number): string[] {
        log(this, `Hit (${x}, ${y})`);

        if (this.internalModel && this.modelSettings.hitAreas) {
            return this.modelSettings.hitAreas
                .filter(({ name, id }) => {
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

                        return left <= x && x <= right && top <= y && y <= bottom;
                    }
                })
                .map(hitArea => hitArea.name);
        }

        return [];
    }

    update(transform: Float32Array) {
        const dt = 16; // TODO: calculate dt

        const model = this.internalModel;

        // model.loadParam();

        const updated = this.motionManager.update();
        if (!updated) {
            this.eyeBlink.update(dt);
        }

        // model.saveParam();

        this.physics && this.physics.update(dt);
        this.pose && this.pose.update(dt);

        // update focus and natural movements
        const t = (performance.now() / 1000) * 2 * Math.PI;
        model.addToParamFloat('PARAM_EYE_BALL_X', this.focusX);
        model.addToParamFloat('PARAM_EYE_BALL_Y', this.focusY);
        model.addToParamFloat('PARAM_ANGLE_X', this.focusX * 30 + 15 * Math.sin(t / 6.5345) * 0.5);
        model.addToParamFloat('PARAM_ANGLE_Y', this.focusY * 30 + 8 * Math.sin(t / 3.5345) * 0.5);
        model.addToParamFloat('PARAM_ANGLE_Z', this.focusX * this.focusY * -30 + 10 * Math.sin(t / 5.5345) * 0.5);
        model.addToParamFloat('PARAM_BODY_ANGLE_X', this.focusX * 10 + 4 * Math.sin(t / 15.5345) * 0.5);
        model.setParamFloat('PARAM_BREATH', 0.5 + 0.5 * Math.sin(t / 3.2345));

        model.update();

        transform[12] += this.offsetX;
        transform[13] -= this.offsetY;
        model.setMatrix(transform);
        model.draw();
    }

    release() {
        if (this.webGLContext) {
            this.textures.forEach(texture => this.webGLContext.deleteTexture(texture));
        }
    }
}
